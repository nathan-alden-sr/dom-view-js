(function ($) {
	$(function () {
		var view = DomView({
			selector: "main",
			links: {
				selector: ".links",
				moreProjectsLink: {
					selector: ".more-projects",
					init: function () {
						this.css("text-decoration", "none");
					},
					_click: function (context, e) {
						if (!confirm("Are you sure you want to leave the example?")) {
							e.preventDefault();
						}
					}
				}
			},
			demographicInformation: {
				selector: ".demographic-information",
				firstNameChangedMessage: ".first-name-changed",
				firstNameTextBox: {
					selector: ".first-name",
					_change: function (context, e) {
						context.firstNameChangedMessage.show();
					}
				},
				lastNameChangedMessage: ".last-name-changed",
				lastNameTextBox: {
					selector: ".last-name",
					_change: function (context, e) {
						context.lastNameChangedMessage.show();
					}
				},
				maleGenderSelectedMessage: function () {
					return "Male gender selected";
				},
				maleRadio: {
					selector: ".male",
					_click: function (context, e) {
						context.fn.genderSelected(context.maleGenderSelectedMessage);
					}
				},
				femaleGenderSelectedMessage: function () {
					return "Female gender selected";
				},
				femaleRadio: {
					selector: ".female",
					_click: function (context, e) {
						context.fn.genderSelected(context.femaleGenderSelectedMessage);
					}
				},
				fn: {
					genderSelected: function (message) {
						alert(message);
					}
				}
			},
			coolTools: {
				selector: ".cool-tools",
				boxes: ".boxes",
				addBoxButton: {
					selector: ".add-box",
					_click: function (context, e) {
						context.fn.addBox();
					}
				},
				fn: {
					addBox: function () {
						var rgba = "rgb(" + Math.floor(Math.random() * 256) + "," + (Math.floor(Math.random() * 256)) + "," + (Math.floor(Math.random() * 256)) + ")";
						
						$("<div class=\"box\"></div>").css("background-color", rgba).appendTo(view.coolTools.boxes);
					},
					clearBoxes: function () {
						view.coolTools.boxes.empty();
					}
				}
			},
			reset: {
				selector: ".reset",
				resetEverythingButton: {
					selector: ".reset-everything",
					_click: function (context, e) {
						view.demographicInformation.firstNameChangedMessage.hide();
						view.demographicInformation.firstNameTextBox.val("");
						view.demographicInformation.lastNameChangedMessage.hide();
						view.demographicInformation.lastNameTextBox.val("");
						view.demographicInformation.maleRadio.prop("checked", false);
						view.demographicInformation.femaleRadio.prop("checked", false);
						view.coolTools.fn.clearBoxes();
					}
				}
			}
		});
	});
})(jQuery);