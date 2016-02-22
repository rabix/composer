/* globals: { key: false } */

class Shortcuts {
	constructor($rootScope) {
		/**
		 * prevent shortcuts from firing when INPUT and SELECT elements are in focus
		 * @param event
		 * @returns {boolean}
		 */
		key.filter = function(event) {
			let tagName = (event.target || event.srcElement).tagName;
			return !(tagName == 'INPUT' || tagName == 'SELECT');
		};

		this.events = events;

		bindShortcuts($rootScope);
	}
}

const bindShortcuts = function($rootScope) {
	/**
	 * Binds standard save shortcut
	 */
	key(keyMap.save, (e, h) => {
		log(h);

		e.preventDefault();
		$rootScope.$broadcast(events.save, {event: e});
	});

	/**
	 * Binds non-standard new shortcut
	 * standard shortcut also bound, for browsers that can be overridden
	 */
	key(keyMap.create, (e, h) => {
		log(h);

		e.preventDefault();
		$rootScope.$broadcast(events.create, {event: e});
	});

	/**
	 * Binds non-standard close
	 * standard shortcut also bound, for browsers that can be overridden
	 */
	key(keyMap.close, (e, h) => {
		log(h);

		e.preventDefault();
		$rootScope.$broadcast(events.close, {event: e});
	});

	/**
	 * Binds Mac OSX standard one tab to right shortcut
	 */
	key(keyMap.moveRight, (e, h) => {
		log(h);

		e.preventDefault();
		$rootScope.$broadcast(events.moveRight, {event: e});
	});


	/**
	 * Binds Mac OSX standard one tab to left shortcut
	 */
	key(keyMap.moveLeft, (e, h) => {
		log(h);

		e.preventDefault();
		$rootScope.$broadcast(events.moveLeft, {event: e});
	})
};

const log = function (h) {
	console.log('triggering keyboard event for ' + h.shortcut);
};

const keyMap = {
	save: 'command+s, ctrl+s',
	create: 'command+n, ctrl+n, command+shift+n, alt+shift+n',
	close: 'shift+command+w, shift+alt+w, command+w, ctrl+w',
	moveRight: 'shift+command+], shift+alt+]',
	moveLeft: 'shift+command+[, shift+alt+['
};

const events = {
	save: 'SAVE',
	create: 'NEW',
	close: 'CLOSE',
	moveRight: 'MOVE_RIGHT',
	moveLeft: 'MOVE_LEFT'
};

angular.module('cottontail').service('Shortcuts', Shortcuts);

export default Shortcuts;
