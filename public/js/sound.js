window.SoundManager = {
	globalVolume: (function() {
		const saved = localStorage.getItem('tt_volume');
		const parsed = parseFloat(saved);
		return !isNaN(parsed) ? parsed : 0.2;
	})(),
	sounds: {
		move: {
			file: new Audio('/sounds/move.mp3'),
			localVolume: 0.3
		},
		victory: {
			file: new Audio('/sounds/victory.mp3'),
			localVolume: 0.1
		},
		defeat: {
			file: new Audio('/sounds/defeat.mp3'),
			localVolume: 0.1
		},
		rematch: {
			file: new Audio('/sounds/rematch.mp3'),
			localVolume: 0.1
		},
		deserter: {
			file: new Audio('/sounds/deserter.mp3'),
			localVolume: 0.1
		}
	},
	init: function() {
		this.updateAllVolumes();
		const slider = document.getElementById('volume-slider');
		if (slider) {
			slider.value = this.globalVolume;
			slider.addEventListener('input', (e) => {
				const val = parseFloat(e.target.value);
				// Proteção contra valores inválidos no input
				if (!isNaN(val)) {
					this.setGlobalVolume(val);
				}
			});
			slider.addEventListener('change', (e) => {
				localStorage.setItem('tt_volume', e.target.value);
			});
		}
	},
	setGlobalVolume: function(val) {
		this.globalVolume = val;
		this.updateAllVolumes();
	},
	updateAllVolumes: function() {
		Object.keys(this.sounds).forEach(key => {
			const s = this.sounds[key];
			const finalVol = this.globalVolume * s.localVolume;
			if (Number.isFinite(finalVol)) {
				s.file.volume = Math.max(0, Math.min(1, finalVol));
			}
		});
	},
	play: function(name) {
		const soundData = this.sounds[name];
		if (soundData && soundData.file) {
			const audio = soundData.file;
			audio.currentTime = 0;
			const finalVol = this.globalVolume * soundData.localVolume;
			if (Number.isFinite(finalVol)) {
				audio.volume = Math.max(0, Math.min(1, finalVol));
			} else {
				audio.volume = 0.2;
			}
			audio.play().catch(() => {});
		}
	}
};
SoundManager.init();