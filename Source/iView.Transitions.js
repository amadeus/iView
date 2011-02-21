(function(){

if (!this.iView) this.iView = {};

var Tr = this.iView.Transitions = {};

Tr.Horizontal = new Class({

	Implements: [Options, Events],

	options: {
		delay: 0,

		transition: '-webkit-transform 400ms ease-in-out, opacity 400ms ease-in-out',

		outgoingTransform: 'translate3d({distance}px,0,0)',
		incomingTransform: 'translate3d(0,0,0)',

		outgoingTitlebarTransform: 'translate3d({halfDistance}px,0,0)',
		incomingTitlebarTransform: 'translate3d(0,0,0)'
	},

	initialize: function(direction, outgoingContent, incomingContent, outgoingTitlebar, incomingTitleBar, options){
		this.options.distance = outgoingContent.getSize().x;
		this.options.halfDistance = this.options.distance / 2;
		this.options.distance = (direction === 'right') ? this.options.distance : '-' + this.options.distance;
		this.options.halfDistance = (direction === 'right') ? this.options.halfDistance : '-' + this.options.halfDistance;

		// This allows the user to override distance on instantiation if necessary
		this.setOptions(options);

		this.transitionComplete = this.transitionComplete.bind(this);

		this.outgoingContent = document.id(outgoingContent)
			.setStyle('-webkit-transition', this.options.transition);
		this.incomingContent = document.id(incomingContent)
			.setStyle('-webkit-transition', this.options.transition)
			.addEvent('transitionend', this.transitionComplete);

		this.outgoingTitlebar = new Elements(outgoingTitlebar)
			.setStyle('-webkit-transition', this.options.transition);
		this.incomingTitleBar = new Elements(incomingTitleBar)
			.setStyle('-webkit-transition', this.options.transition);

		this.transitionStart.delay(this.options.delay, this);
	},

	transitionStart: function(){
		this.outgoingContent.setStyle('-webkit-transform', this.options.outgoingTransform.substitute({ distance: this.options.distance }));
		this.incomingContent.setStyle('-webkit-transform', this.options.incomingTransform);

		this.outgoingTitlebar.setStyles({
			'opacity': 0,
			'visibility': 'visible',
			'-webkit-transform': this.options.outgoingTitlebarTransform.substitute({ halfDistance: this.options.halfDistance })
		});

		this.incomingTitleBar.setStyles({
			'opacity': 1,
			'-webkit-transform': this.options.incomingTitlebarTransform
		});
	},

	transitionComplete: function(e){
		if (e.target !== this.incomingContent) return;

		this.incomingContent.removeEvent('transitionend', this.transitionComplete)
			.setStyle('-webkit-transition', null);

		if (this.outgoingContent) this.outgoingContent.setStyle('-webkit-transition', null);

		this.fireEvent('complete');
	}

});

Tr.Horizontal.extend({

	prep: function(outgoing, incoming, direction){
		var distance = outgoing.getSize().x;
		distance = (direction === 'left') ? distance : '-' + distance;
		outgoing.setStyle('-webkit-transform', 'translate3d(0,0,0)');
		incoming.setStyle('-webkit-transform', 'translate3d(' + distance + 'px,0,0)');
	}

});

Tr.validateDelay = function(delay){
	return (typeOf(delay) === 'number') ? delay : 0;
};

}).call(this);