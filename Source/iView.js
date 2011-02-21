(function(){

var iView = this.iView = new Class({

	Implements: [Options, Events],

	options: {
		viewName: '',

		// Determines whether the view should hide the tab bar or not
		fullHeight: true,
		tabBarHeight: 50,

		// If true, will inject view into parent on instantiation
		inject: true,

		// Which page to start with
		page: 'initial',

		// parent: [HTMLElement]
		className: 'iView',

		titleBar: {
			enabled: true,
			height: 44
		},

		containerStyles: {},

		maxViewSize: { x: Infinity, y: Infinity },

		previousPage: 'initial'
	},

	busy: true,

	pages: {},

	pageIndexes: [],

	initialize: function(data, view, options){
		this.dataModel = Object.clone(data);
		this.viewModel = Object.clone(view);
		this.setOptions(options);

		this.parent = document.id(this.options.parent) || document.body;
		this.navigate = this.navigate.bind(this);
		this.pageIndexes = iView.getPageIndexes(this.viewModel);

		this.viewSize = this.parent.getSize();
		this.viewSize.y = (this.viewSize.y > this.options.maxViewSize.y) ? this.options.maxViewSize.y : this.viewSize.y;
		if (!this.options.fullHeight) this.viewSize.y -= this.options.tabBarHeight;

		this.container = new Element('div', {
			'class': this.options.className + ' ' + this.options.viewName,
			styles: { height: this.viewSize.y }
		});

		this.container.setStyles(this.options.containerStyles);

		if (this.options.inject) this.container.inject(this.parent);

		if (this.options.titleBar) {
			this.titlebar = new TitleBar(this.container, this.options.titleBar);
			this.titlebar.addEvents({
				confirm: this.confirm.bind(this),
				destroy: this.startDestroy.bind(this),
				navigate: this.navigate.bind(this),
				navigateBack: this.navigateBack.bind(this)
			});
		}

		this.content = new Element('div', {
			'class': 'content',
			styles: {
				top: (this.options.titleBar.enabled) ? this.options.titleBar.height : 0,
				height: (this.options.titleBar.enabled) ? this.viewSize.y - this.options.titleBar.height : this.viewSize.y
			}
		}).inject(this.container);

		if (this.options.titleBar.enabled)
			this.titlebar.update(this.viewModel[this.options.page].titleBar);

		this.createScrollView(this.options.page, true);
	},

	displayComplete: function(){
		this.fireEvent('display');
		this.busy = false;
	},

	createScrollView: function(page, inject, direction){
		this.pages[page] = new Content(this.content, this.viewModel[page].content, this.dataModel,{
			inject: inject,
			onNavigate: this.navigate
		});
	},

	navigateBack: function(){
		this.navigate(this.options.previousPage || 'initial');
	},

	navigate: function(page){
		if (this.busy) return;
		this.busy = true;
		var currentPage = this.options.page,
			currentElement = document.id(this.pages[currentPage]),
			newElement,
			oldTitleBar = this.titlebar.elements,
			direction = iView.getDirection(currentPage, page, this.pageIndexes);

		this.options.previousPage = this.options.page;

		if (this.options.titleBar.enabled) this.titlebar.update(this.viewModel[page].titleBar, direction);
		if (!this.pages[page]) this.createScrollView(page, false, direction);
		else this.pages[page].refreshData();

		this.options.page = page;

		newElement = document.id(this.pages[page]);

		iView.Transitions.Horizontal.prep(currentElement, newElement, direction);

		newElement.inject(this.content);
		this.pages[page].refresh();

		new iView.Transitions.Horizontal(
			direction,
			currentElement,
			newElement,
			oldTitleBar,
			this.titlebar.elements, {
				onComplete: this.transitionComplete.bind(this, [page, currentPage, oldTitleBar])
			}
		);
	},

	transitionComplete: function(page, oldPage, oldTitleBar){
		document.id(this.pages[oldPage]).destroy();
		delete this.pages[oldPage];
		if (oldTitleBar) oldTitleBar.destroy();
		this.busy = false;
	},

	confirm: function(){
		if (this.titlebar.elements)
			this.titlebar.elements.setStyle('opacity', .6);

		this.fireEvent('confirm', this.dataModel);
	},

	clean: function(){
		this.container.destroy();
	},

	startDestroy: function(){
		this.fireEvent('startDestroy');

		// Hmmm, what to do here!
		this.endDestroy();
	},

	endDestroy: function(){
		this.container.destroy();
		this.fireEvent('endDestroy');
	},

	toElement: function(){
		return this.container;
	}
});

iView.extend({

	getPageIndexes: function(obj){
		var arr = [],
			fn = function(obj, key){
				arr.push(key);
			};

		Object.each(obj, fn);

		return arr;
	},

	// Using the page index map, determine direction of movement
	getDirection: function(from, to, arr){
		from = arr.indexOf(from);
		to = arr.indexOf(to);
		return (to > from) ? 'left' : 'right';
	}

});

var TitleBar = this.iView.TitleBar = new Class({

	Implements: [Options, Events],

	options: {
		className: 'titlebar',
		animationOffset: '180px'
	},

	elements: [],

	initialize: function(parent, options){
		this.setOptions(options);
		this.container = new Element('div', {
			'class': this.options.className
		}).inject(parent);
	},

	update: function(model, animDirection){
		var title, leftButton, rightButton, offset = 0;

		if (animDirection === 'left') offset = this.options.animationOffset;
		if (animDirection === 'right') offset = '-' + this.options.animationOffset;

		this.elements = [];

		title = new Element('h1', {
			text: model.text,
			'class': this.options.titleClass
		}).inject(this.container);

		this.elements.push(title);

		if (model.leftButton) {
			leftButton = new model.leftButton.type('left', this.container, model.leftButton.options);
			leftButton.addEvents({
				back: this.navigateBack.bind(this),
				cancel: this.destroyView.bind(this)
			});
			this.elements.push(document.id(leftButton));
		}

		if (model.rightButton) {
			rightButton = new model.leftButton.type('right', this.container, model.rightButton.options);
			rightButton.addEvents({
				navigate: this.navigate.bind(this),
				confirm: this.confirm.bind(this)
			});
			this.elements.push(document.id(rightButton));
		}

		this.elements = new Elements(this.elements);

		if (!animDirection) return;

		this.elements.setStyles({
			opacity: 0,
			visibility: 'visible',
			webkitTransform: 'translate3d(' + offset + ',0,0)'
		});
	},

	navigate: function(to){
		this.fireEvent('navigate', to);
	},

	navigateBack: function(){
		this.fireEvent('navigateBack');
	},

	confirm: function(){
		this.fireEvent('confirm');
	},

	destroyView: function(){
		this.fireEvent('destroy');
	},

	toElement: function(){
		return this.container;
	}

});

var Button = this.iView.TitleBar.Button = new Class({

	Implements: [Options, Events],

	options: {
		buttonClass: 'css-button',
		ellipses: true,
		action: 'back',
		arguments: []
	},

	initialize: function(position, container, options){
		this.setOptions(options);

		this.button = new Element('div', {
			'class': this.options.buttonClass + ' ' + position,
			text: options.content,
			events: {
				click: this.click.bind(this)
			}
		}).inject(container);

		if (this.options.action === 'back') this.button.addClass('back');
	},

	click: function(){
		this.fireEvent(this.options.action, this.options.arguments);
	},

	toElement: function(){
		return this.button;
	}

});

var Content = this.iView.Content = new Class({

	Implements: [Options, Events],

	options: {
		inject: true
	},

	elements: {},

	initialize: function(container, model, data, options){
		this.data = data;
		this.model = model;
		this.container = document.id(container);
		this.setOptions(options);

		this.slideContainer = new Element('div', {
			styles: {
				overflow: 'hidden',
				position: 'absolute',
				width: '100%',
				height: '100%'
			}
		});

		this.scrollContainer = new Element('div', {
			'class': 'iscroll',
			styles: {
				overflow: 'hidden',
				position: 'absolute',
				width: '100%'
			}
		}).inject(this.slideContainer);

		this.model.each(this.generate, this);

		if (!this.options.inject) return;

		this.slideContainer.inject(this.container);
		this.initializeScroll();
	},

	initializeScroll: function(){
		this.iscroll = new iScroll(this.scrollContainer, {
			desktopCompatibility: true
		});
	},

	toElement: function(){
		return this.slideContainer;
	},

	refresh: function(){
		if (!this.iscroll) this.initializeScroll();
		this.iscroll.refresh();
	},

	refreshData: function(){
		var refreshObj = function(els, key){
				var data = this.data[key];

				if (typeOf(data) === 'array') {
					this.elements[key].each(function(els, i){
						var data2 = this.data[key][i];
						// Only supporting labels at the moment me thinks?
						if (els.label) els.label.set('text', data2.display || data2.value);
						var li = els.label.getParent('li');
						if (li.hasClass('highlight')) li.removeClass('highlight');
					}, this);
					return;
				}

				if (els.label) els.label.set('text', data.label);
				if (els.value) els.value.set('text', data.display || data.value);
				var li = els.label.getParent('li');
				if (li.hasClass('highlight')) li.removeClass('highlight');
			};

		Object.each(this.elements, refreshObj, this);

		this.iscroll.setPosition(0,0);
	},

	set: function(obj, key, value){
		var ref = this.data[obj];
		if (typeOf(ref) !== 'object') return this;
		ref[key] = value;
	},

	generate: function(model){
		if (typeOf(model.type) !== 'class') return dbg.log('Content: No class was defined for this type', model.type);

		var instance = new model.type(model.content, this.data, {
			onNavigate: this.navigate.bind(this)
		});

		document.id(instance).inject(this.scrollContainer);
	},

	navigate: function(to){
		this.fireEvent('navigate', to);
	}

});

var Text = this.iView.Text = new Class({

	options: {
		elTag: 'p'
	},

	initialize: function(content, data){
		this.element = new Element(this.options.elTag, {
			text: data[content].display
		});
	},

	toElement: function(){
		return this.element;
	}

});

var Header = this.iView.Header = new Class({

	Extends: Text,

	options: { elTag: 'h2' }

});

}).call(this);