(function(){

if(!this.iView) return;

var UnitList = this.iView.UnitList = new Class({

	Implements: [Options, Events],

	options: {
		containerClass: 'unit-list',
		highlightClass: 'highlight'
	},

	units: [],

	initialize: function(viewModel, dataModel, options){
		this.viewModel = viewModel;
		this.dataModel = dataModel;
		this.setOptions(options);
		this.setData = this.setData.bind(this);

		this.container = new Element('ul', { 'class': this.options.containerClass })
			.addEvent('click:relay(li)', this.delegateClick.bind(this));

		this.viewModel.each(this.renderElements, this);
	},

	renderElements: function(model){
		if (typeOf(model.type) !== 'class') return;
		var data = this.dataModel[model.data], klass;

		if (model.map === true)
			return this.renderMap(model, data);

		klass = new model.type(model.data, data, {
			onSetData: this.setData
		});

		document.id(klass).inject(this.container);
		this.units.push(klass);
	},

	renderMap: function(model, data){
		var renderItem = function(itemData){
			var modelClone = Object.clone(data.map), klass;
			modelClone = Object.merge(modelClone, itemData);
			klass = new model.type(model.data, modelClone);
			document.id(klass).inject(this.container);
			this.units.push(klass);
		};

		data.values.each(renderItem, this);
	},

	setData: function(modelKey, key, value){
		if (!this.dataModel[modelKey]) this.dataModel[modelKey] = {};
		this.dataModel[modelKey][key] = value;
	},

	delegateClick: function(event, el){
		var to = el.retrieve('iview-nav-to'),
			set = el.retrieve('iview-set');

		if (set) this.getSetData(el);

		if (!to) return;
		event.stop();
		this.navigate(el, to);
	},

	getSetData: function(el){
		var modelKey = el.retrieve('iview-set-key'),
			value = el.retrieve('iview-set-value'),
			display = el.retrieve('iview-set-display');

		if (!modelKey) return;

		this.setData(modelKey, 'value', value);
		this.setData(modelKey, 'display', display);
	},

	navigate: function(el, to){
		el.addClass(this.options.highlightClass);
		this.fireEvent('navigate', to);
	},

	toElement: function(){
		return this.container;
	}
});

var Item = this.iView.UnitList.Item = new Class({

	Implements: [Options, Events],

	options: {
		containerClass: '',
		navClass: 'nav'
	},

	initialize: function(key, model, options){
		this.setOptions(options);
		this.modelKey = key;
		this.model = model;
		this.container = new Element('li', { 'class': this.options.containerClass });
		if (model.nav) this.container.addClass(this.options.navClass);
		if (model.to) this.container.store('iview-nav-to', model.to);
		if (model.callback) this.container.addEvent('click', model.callback);
		if (model.set) this.storeSet();
	},

	storeSet: function(){
		this.container
			.store('iview-set', true)
			.store('iview-set-key', this.model.set)
			.store('iview-set-value', this.model.value)
			.store('iview-set-display', this.model.display);
	},

	toElement: function(){
		return this.container;
	}
});


var Label = this.iView.UnitList.Label = new Class({

	Extends: Item,

	options: {
		containerClass: 'label',
		ellipses: true
	},

	initialize: function(key, model, options){
		this.parent(key, model, options);

		this.label = new Element('span', {
			text: model.label || model.value
		}).inject(this.container);

		if (this.options.ellipses) this.label.addClass('ellipses');
	}

});

var LabelValue = this.iView.UnitList.LabelValue = new Class({

	Extends: Label,

	options: {
		containerClass: 'label-value',
		valueClass: 'value',
		valueEllipses: true
	},

	initialize: function(key, model, options){
		this.parent(key, model, options);

		this.value = new Element('span', {
			'class': this.options.valueClass,
			text: model.display || model.value
		}).inject(this.container);

		if (this.options.valueEllipses) this.value.addClass('ellipses');
	}

});

var LabelInput = this.iView.UnitList.LabelInput = new Class({

	Extends: Label,

	options: {
		containerClass: 'label-input'
	},

	initialize: function(key, model, options){
		this.parent(key, model, options);

		this.input = new Element('input', {
			placeholder: model.placeholder,
			value: model.value,
			type: 'text'
		}).inject(this.container);

		this.input.addEvent('blur', this.setValue.bind(this));

		if (this.options.valueEllipses) this.value.addClass('ellipses');
	},

	setValue: function(){
		this.fireEvent('setData', [this.modelKey, 'value', this.input.value]);
	}

});

var LabelToggle = this.iView.UnitList.LabelToggle = new Class({

	Extends: Label,

	options: {
		containerClass: 'label-toggle'
	},

	initialize: function(key, model, options){
		this.parent(key, model, options);

		this.checkbox = new Element('input', {
			checked: model.value,
			type: 'checkbox'
		}).inject(this.container);

		this.checkbox.addEvent('change', this.setValue.bind(this));
	},

	setValue: function(){
		this.fireEvent('setData', [this.modelKey, 'value', this.checkbox.checked]);
	}

});

iView.extend = {

	getClassString: function(){
		return Array.from(arguments).join(' ');
	}

};

}).call(this);