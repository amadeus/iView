(function(){

var Eg = this.Example = new Class({

	initialize: function(button){
		this.button = document.id(button);
		this.button.addEvent('click', this.createView.bind(this));
	},

	createView: function(){
		var view = Object.clone(Eg.ViewModel),
			data = Object.clone(Eg.DataModel);

		this.view = new iView(data, view);
		this.view.addEvent('cancel', this.view.startDestroy.bind(this.view));
	}

});

Eg.extend({

	ViewModel: {
		initial: {
			titleBar: {
				text: 'iView Examples',
				leftButton: {
					type: iView.TitleBar.Button,
					options: {
						action: 'cancel',
						content: 'Cancel'
					}
				}
			},

			content: [
				{
					type: iView.Text,
					content: 'introMessage'
				},

				{
					type: iView.Header,
					content: 'unitlistTitle'
				},

				{
					type: iView.UnitList,
					content: [
						{
							type: iView.UnitList.Label,
							data: 'labelExample'
						},
						{
							type: iView.UnitList.Label,
							data: 'labelWithNav'
						},
						{
							type: iView.UnitList.LabelInput,
							data: 'labelWithInput'
						},
						{
							type: iView.UnitList.LabelValue,
							data: 'labelWithValue'
						},
						{
							type: iView.UnitList.LabelValue,
							data: 'labelWithValueNav'
						}
					]
				}
			]
		}
	},

	DataModel: {
		introMessage: {
			display: 'Welcome to iView, an awesome iPhone UI library based on MooTools! Here you will find a series of examples of what iView is capable of.'
		},

		unitlistTitle: {
			display: 'A UnitList Example:'
		},

		labelExample: {
			label: 'A Simple Label'
		},

		labelWithNav: {
			label: 'A Label w/Nav Arrow',
			nav: true
		},

		labelWithInput: {
			label: 'Input',
			value: '',
			placeholder: 'Type Here'
		},

		labelWithValue: {
			label: 'Device',
			value: 'iPhone'
		},

		labelWithValueNav: {
			label: 'OS',
			value: '4.2',
			nav: true
		}
	}

});

}).call(this);