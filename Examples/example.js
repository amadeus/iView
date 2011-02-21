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
				}
			]
		}
	},

	DataModel: {
		introMessage: {
			display: 'Welcome to iView, an awesome iPhone UI library based on MooTools! Here you will find a series of examples of what iView is capable of.'
		}
	}

});

}).call(this);