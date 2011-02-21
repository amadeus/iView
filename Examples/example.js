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
		this.view.displayComplete();
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
							type: iView.UnitList.LabelInput,
							data: 'labelWithInput'
						},
						{
							type: iView.UnitList.LabelValue,
							data: 'labelWithValue'
						}
					]
				}
			]
		},

		device: {
			titleBar: {
				text: 'Devices',
				leftButton: {
					type: iView.TitleBar.Button,
					options: {
						action: 'back',
						content: 'Examples'
					}
				}
			},

			content: [
				{
					type: iView.UnitList,
					content: [
						{
							type: iView.UnitList.Label,
							data: 'devices',
							map: true
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

		labelWithInput: {
			label: 'Input',
			value: '',
			placeholder: 'Type Here'
		},

		labelWithValue: {
			label: 'Device',
			value: 'iPhone',
			nav: true,
			to: 'device'
		},

		devices: {
			values: [
				{
					label: 'iPhone',
					value: 'iphone',
					display: 'iPhone'
				},

				{
					label: 'iPhone 3G',
					value: 'iphone3g',
					display: 'iPhone 3G'
				},

				{
					label: 'iPhone 3GS',
					value: 'iphone3gs',
					display: 'iPhone 3GS'
				},

				{
					label: 'iPhone 4',
					value: 'iphone4',
					display: 'iPhone 4'
				}
			],
			map: {
				set: 'labelWithValue',
				to: 'initial'
			}
		}
	}

});

}).call(this);