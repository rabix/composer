/* global key */

export const keyMap = {
    save: {
        keyMaster: 'command+s, ctrl+s',
        ACE: {win: 'Ctrl-S', mac: 'Command-S'}
    },
    'new': {
        keyMaster: 'command+n, ctrl+n',
        ACE: {win: 'Ctrl-N', mac: 'Command-N'}
    },
    close: {
        keyMaster: 'shift+command+w, shift+alt+w',
        ACE: {win: 'Shift-Alt-W', mac: 'Shift-Command-W'}
    },
    tabLeft: {
        keyMaster: 'shift+command+[, shift+alt+[',
        ACE: {win: 'Shift-Alt-[', mac: 'Shift-Command-['}
    },
    tabRight: {
        keyMaster: 'shift+command+], shift+alt+]',
        ACE: {win: 'Shift-Alt-]', mac: 'Shift-Command-]'}
    }
};

export function setSave(callback) {
	key(keyMap.save.keyMaster, callback);
}

export function setNew(callback) {
	key(keyMap.new.keyMaster, callback);
}

export function setTabLeft(callback) {
	key(keyMap.tabLeft.keyMaster, callback);
}

export function setTabRight(callback) {
	key(keyMap.tabRight.keyMaster, callback);
}

export function setClose(callback) {
	key(keyMap.close.keyMaster, callback);
}


