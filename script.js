"use strict";
class PadBehaviour {
  togglePadPressedClass(pad) {
    pad.classList.contains("pad-pressed")
      ? pad.classList.remove("pad-pressed")
      : pad.classList.add("pad-pressed");
  }

  clearSelectedPads() {
    document.querySelectorAll(".pad-pressed").forEach(pad => {
      pad.classList.remove("pad-pressed");
    });
  }

  toggleStepPlayClass(step) {
    if (step === 0) {
      this.addStepPlayClass(step);
    } else if (step === 8) {
      this.removeStepPlayClass(step);
    } else {
      this.removeStepPlayClass(step);
      this.addStepPlayClass(step);
    }
  }

  addStepPlayClass(step) {
    document.querySelector(`#step-${step + 1}`).classList.add("step-play");
  }

  removeStepPlayClass(step) {
    document.querySelector(`#step-${step}`).classList.remove("step-play");
  }
}

class StepSequencer {
  constructor() {
    this.audioContext = new AudioContext();
    this.timeInput = 4000;
    this.scale = this.getScale();
    this.masterVolume = this.audioContext.createGain();
    this.steps = this.createStepTemplate();
    this.pads = new PadBehaviour();
    this.stop = true;

    this.elements = {};
    this.init();
  }

  init() {
    this.getElements();
    this.masterVolume.gain.value = 0.25;
    this.masterVolume.connect(this.audioContext.destination);
    this.updateBPMDisplay(this.elements.sliderBPM.value);

    this.registerEvents();
  }

  registerEvents() {
    this.elements.controls.addEventListener("click", e => {
      // replace by switch statement
      if (e.target.closest("#play")) {
        if (this.stop === true) {
          this.toggleStop();
          this.toggleDisabledAttribute(this.elements.play);
          this.toggleDisabledAttribute(this.elements.stop);
        }
        this.playSequence(this.timeInput);
      } else if (e.target.closest("#stop")) {
        if (this.stop === false) {
          this.toggleStop();
          this.toggleDisabledAttribute(this.elements.stop);
          this.toggleDisabledAttribute(this.elements.play);
        }
        // find an instant way to stop the sequence player
      } else if (e.target.closest("#delete")) {
        this.clearSelectedPads();
        this.addFalseValues(this.steps);
      }
    });

    this.elements.sliderBPM.addEventListener("input", e => {
      this.setBPM(e.target.value);
      this.updateBPMDisplay(e.target.value);
    });

    this.elements.pads.forEach(pad => {
      pad.addEventListener("click", () => {
        this.pads.togglePadPressedClass(pad);
      });
    });

    // EventListener add sound changing arrayValues
    // change that
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        document
          .querySelector("#step-" + (i + 1))
          .children[j].addEventListener("click", () => {
            this.togglePadPlay(i, j);
          });
      }
    }
  }

  playSequence(time) {
    if (this.stop === true) {
      return;
    }
    // snippet: if play already running: restart

    for (let i = 0; i < 8; ++i) {
      let j = i;
      setTimeout(() => {
        this.pads.toggleStepPlayClass(j);
        this.playChord(
          this.steps[j],
          time / 8000,
          this.elements.instrument.value
        );
      }, time * j / 8);
    }

    setTimeout(() => {
      this.pads.toggleStepPlayClass(8);
    }, time);

    setTimeout(() => {
      this.playSequence(this.timeInput);
    }, time);
  }

  playChord(step, time, tone) {
    let chord = [];
    for (let i = 0; i < 8; i++) {
      if (step[i]) {
        chord[i] = this.audioContext.createOscillator();
        chord[i].frequency.value = this.scale[i];

        chord[i].type = tone;
        chord[i].connect(this.masterVolume);
        chord[i].start(this.audioContext.currentTime);
        chord[i].stop(this.audioContext.currentTime + time);
      }
    }
  }

  togglePadPlay(row, line) {
    if (this.steps[row][line]) {
      this.steps[row][line] = false;
    } else {
      this.steps[row][line] = true;
    }
  }

  toggleStop() {
    this.stop === true ? (this.stop = false) : (this.stop = true);
  }

  toggleDisabledAttribute(element) {
    if (element.hasAttribute("disabled")) {
      element.removeAttribute("disabled", "disabled");
      console.log("element enabled", element);
    } else {
      element.setAttribute("disabled", "disabled");
      console.log("element disabled", element);
    }
  }

  setBPM(value) {
    this.timeInput = 480000 / value;
  }

  updateBPMDisplay(value) {
    this.elements.sliderDisplay.innerHTML = `${value} BPM`;
  }

  createStepTemplate() {
    let steps = new Array(8);
    for (let i = 0; i < 8; i++) {
      steps[i] = [false, false, false, false, false, false, false, false];
      // default pad value is false, i.e. unpressed
    }

    return steps;
  }

  getScale() {
    const gmin = [
      195.995,
      220,
      233.082,
      261.626,
      293.665,
      311.127,
      349.228,
      391.995
    ];
    return gmin;
  }

  getElements() {
    Object.assign(this.elements, {
      controls: document.querySelector("#controls"),
      pads: document.querySelectorAll(".pad"),
      play: document.querySelector("#play"),
      stop: document.querySelector("#stop"),
      record: document.querySelector("#record"),
      delete: document.querySelector("#delete"),
      sliderBPM: document.querySelector("#bpm-slider"),
      sliderDisplay: document.querySelector("#bpm-display"),
      instrument: document.querySelector("#instrument-control"),
      octave: document.querySelector("#octave-control"),
      style: document.querySelector("#style-control")
    });
  }
}

const sequencer = new StepSequencer();
