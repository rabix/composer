/**
 * Created by Maya on 4.8.15.
 */
import ControlElement from '../control-element/controlElement.directive';

class DropdownDirective extends ControlElement {
	constructor () {
		super();

		this.templateUrl = 'app/components/ui/dropdown/dropdown.html';
		this.controller = DropdownController;
		this.controllerAs = 'dd';
		this.scope = {
			name: '@',
			intention: '@'
		};

		this.compile = function compile(elem, attr) {
			var intention = attr.intention || 'default';
			var content = attr.content;
			var contentWrapper = elem.find('.dropdown-content');

			elem.find('rb-button').attr('intention', intention);

			if (contentWrapper.length > 0) {
				if (content !== 'undefined' && content !== '') {
					contentWrapper.replaceWith(attr.content);
				} else {
					contentWrapper.remove();
				}
			}

			return {
				post: postLink
			};
		};
		
		function postLink (scope, element, attr, ctrl, transcludeFn) {
			let transclusionScope;

			transcludeFn(function (clone, sc) {

				if ( !clone.length ) {
					clone.remove();
					sc.$destroy();
					return;
				}

				let ul = clone;

				angular.forEach(clone, function (el) {

					if (typeof $(el).attr('dropdown-body') !== 'undefined') {
						element.children().remove();
						ul = clone.find('ul');
					}

				});

				ul.addClass('dropdown-menu dropdown-menu-' + attr.position);
				ul.attr('role', 'menu');

				element.find('.ct-dropdown').append(clone);

				transclusionScope = sc;
			});

			element.on('remove', function() {
					scope.$destroy();
					transclusionScope.$destroy();
				})
				.on('focus', function() {
					element.addClass('ct-focus');
					element.trigger('focus');
				})
				.on('blur', function() {
					element.removeClass('ct-focus');
					element.children().trigger('blur');
				});
		}
	}
}

class DropdownController {
	constructor() {

	}
}

angular.module('cottontail').directive('ctDropdown', () => new DropdownDirective);

export default DropdownDirective;