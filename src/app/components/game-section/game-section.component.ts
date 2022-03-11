import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, interval, timer } from 'rxjs';
import { scan, takeWhile, tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-game-section',
  templateUrl: './game-section.component.html',
  styleUrls: ['./game-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameSectionComponent implements OnInit {

  numbers!: MathProblem;

  previousProblems: MathProblem[] | any = [];

  model: any = null;

  timerInterval$ = interval(1000);
  time = 30;
  gameStart = false
  gameInProgress$: any;

  timer$ = timer(0, 1000)
    .pipe(
      tap(val => console.log('before',{val,})),
      scan((acc, curr) => {console.log({acc, curr}); return --acc}, this.time + 1),
      tap(val => console.log('after',{val,})),
      takeWhile((x) => x >= 0),
      finalize(() => this.gameInProgress$.next(false))
    )

  countDown$: any;

  ngOnInit(): void {
    this.createNumbers();

    this.gameInProgress$ = new BehaviorSubject(false)
      .pipe(
        tap(t => console.log('in progress', t)),
        tap(t => {
          if(t) {
            this.model = null;
          // this.numbers = {first: null, second: null, answer: null};
          this.previousProblems = [];
          }
        })
      );

  }

  createNumbers() {
    const first = this.randomNum10();
    const second = this.randomNum10();

    this.numbers = {
      first,
      second,
      answer: first + second,
    }
  }

  private randomNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  checkAnswer() {
    const isAnswerCorrect = this.model === this.numbers.answer;
    console.log("answers",this.model, this.numbers.answer)
    this.nextProblem()
  }

  nextProblem() {
    this.previousProblems.push({...this.numbers, correct: this.model === this.numbers.answer});

    console.log('previous',this.previousProblems)
    this.model = null;
    this.createNumbers();
  }

  randomNum10() {
    return this.randomNumber(1,10)
  }

  randomNum20() {
    return this.randomNumber(1,20)
  }

  startGame() {
    this.gameInProgress$.next(true)
  }

}

interface MathProblem {
  first: number,
  second: number,
  answer: number,
  correct?: boolean,
}

