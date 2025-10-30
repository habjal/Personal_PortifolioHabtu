class AnimatedHeadline {
  constructor() {
    this.config = {
      animationDelay: 2500,
      barAnimationDelay: 3800,
      barWaiting: 0,
      lettersDelay: 50,
      typeLettersDelay: 150,
      selectionDuration: 500,
      typeAnimationDelay: 0,
      revealDuration: 600,
      revealAnimationDelay: 1500
    }
    this.config.barWaiting = this.config.barAnimationDelay - 3000;
    this.config.typeAnimationDelay = this.config.selectionDuration + 800;
  }

  init() {
    const singleLetters = document.querySelectorAll('.cd-headline.letters');
    if (singleLetters) {
      singleLetters.forEach(headline => {
        this.singleLetters(headline.querySelectorAll('b'))
      })
    }
    const headlines = document.querySelectorAll('.cd-headline');
    if (headlines) {
      this.animatedHeadline(headlines);

    }
  }

  singleLetters(words) {
    words.forEach(word => {
      const letters = word.textContent.split('');
      const selected = word.classList.contains('is-visible');
      for (let i = 0; i < letters.length; i++) {
        if (word.closest('.rotate-2')) letters[i] = `<em>${letters[i]}</em>`;
        letters[i] = selected ? `<i class="in">${letters[i]}</i>` : `<i>${letters[i]}</i>`
      }
      const newLetters = letters.join('');
      word.innerHTML = newLetters;

      word.style.opacity = '1';
    })
  }

  animatedHeadline(headlines) {
    let duration = this.config.animationDelay;
    headlines.forEach(headline => {
      if (headline.classList.contains('loading-bar')) {
        duration = this.config.barAnimationDelay;
        setTimeout(() => {
          headline.querySelector('.cd-words-wrapper').classList.add('is-loading')
        }, this.config.barWaiting)
      } else if (headline.classList.contains('clip')) {
        const spanWrapper = headline.querySelector('.cd-words-wrapper');
        const newWidth = spanWrapper.getBoundingClientRect().width + 10;
        spanWrapper.style.width = `${newWidth}px`;
      } else if (!headline.classList.contains('type')) {
        const words = headline.querySelectorAll('.cd-words-wrapper b');
        let width = 0;
        words.forEach(word => {
          const wordWidth = word.getBoundingClientRect().width;
          if (wordWidth > width) width = wordWidth;
        });
        headline.querySelector('.cd-words-wrapper').style.width = `${width}px`;
      }

      // Trigger Animation
      setTimeout(() => {
        this.hideWord(headline.querySelector('.is-visible'))
      }, duration)
    });
  }

  hideWord(word) {
    const nextWord = this.takeNext(word);

    if (word.closest('.cd-headline').classList.contains('type')) {
      const parentSpan = word.closest('.cd-words-wrapper');
      parentSpan.classList.add('selected');
      parentSpan.classList.remove('waiting');

      setTimeout(() => {
        parentSpan.classList.remove('selected');
        word.classList.remove('is-visible');
        word.classList.add('is-hidden');
        word.querySelectorAll('i').forEach(i => {
          i.classList.remove('in');
          i.classList.add('out');
        })
      }, this.config.selectionDuration);
      setTimeout(() => {
        this.showWord(nextWord, this.config.typeLettersDelay)
      }, this.config.typeAnimationDelay)
    }
    else if (word.closest('.cd-headline').classList.contains('letters')) {
      const isEqualLength = (word.querySelectorAll('i').length >= nextWord.querySelectorAll('i').length);
      this.hideLetter(word.querySelector('i'), word, isEqualLength, this.config.lettersDelay);
      this.showLetter(nextWord.querySelector('i'), nextWord, isEqualLength, this.config.lettersDelay);
    }
    else if (word.closest('.cd-headline').classList.contains('clip')) {
      word.closest('.cd-words-wrapper').style.width = '2px';
      word.closest('.cd-words-wrapper').style.transition = `width ${this.config.revealDuration}ms`;
      setTimeout(() => {
        this.switchWord(word, nextWord);
        this.showWord(nextWord);
      }, this.config.revealDuration);
    }
    else if (word.closest('.cd-headline').classList.contains('loading-bar')) {
      const wordsWrapper = word.closest('.cd-words-wrapper');
      wordsWrapper.classList.remove('is-loading');
      this.switchWord(word, nextWord);
      setTimeout(() => {
        this.hideWord(nextWord)
      }, this.config.barAnimationDelay)
      setTimeout(() => {
        wordsWrapper.classList.add('is-loading')
      }, this.config.barWaiting)
    }
    else {
      this.switchWord(word, nextWord);
      setTimeout(() => {
        this.hideWord(nextWord)
      }, this.config.animationDelay);
    }
  }
  showWord(word, duration) {
    if (word.closest('.cd-headline').classList.contains('type')) {
      this.showLetter(word.querySelector('i'), word, false, duration);
      word.classList.add('is-visible');
      word.classList.remove('is-hidden');
    }
    else if (word.closest('.cd-headline').classList.contains('clip')) {
      word.closest('.cd-words-wrapper').style.width = `${word.getBoundingClientRect().width + 10}px`;
      word.closest('.cd-words-wrapper').style.transition = `width ${this.config.revealDuration}ms`;
      setTimeout(() => {
        this.hideWord(word);
      }, this.config.revealDuration + this.config.revealAnimationDelay);
    }
  }
  hideLetter(letter, word, isEqualLength, duration) {
    letter.classList.remove('in');
    letter.classList.add('out');
    const self = this;
    if (letter.nextElementSibling) {
      setTimeout(() => {
        self.hideLetter(letter.nextElementSibling, word, isEqualLength, duration)
      }, duration);
    } else if (isEqualLength) {
      setTimeout(() => {
        self.hideWord(self.takeNext(word));
      }, self.config.animationDelay)
    }

    if (!letter.nextElementSibling && document.querySelector('html').classList.contains('no-csstransitions')) {
      const nextWord = this.takeNext(word);
      this.switchWord(word, nextWord);
    }
  }
  showLetter(letter, word, isEqualLength, duration) {
    letter.classList.add('in');
    letter.classList.remove('out');
    const self = this;
    if (letter.nextElementSibling) {
      setTimeout(() => {
        self.showLetter(letter.nextElementSibling, word, isEqualLength, duration)
      }, duration)
    } else {
      if (word.closest('.cd-headline').classList.contains('type')) {
        setTimeout(() => {
          word.closest('.cd-words-wrapper').classList.add('waiting')
        }, 200);
      }
      if (!isEqualLength) {
        setTimeout(() => {
          self.hideWord(word)
        }, self.config.animationDelay)
      }
    }
  }

  takeNext(word) {
    return (word.nextElementSibling) ? word.nextElementSibling : word.parentNode.children[0];
  }

  switchWord(oldWord, newWord) {
    oldWord.classList.remove('is-visible');
    oldWord.classList.add('is-hidden');
    newWord.classList.remove('is-hidden');
    newWord.classList.add('is-visible');
  }
}

window.addEventListener('load', function () {
  aniHeadline = new AnimatedHeadline();
  aniHeadline.init();
});