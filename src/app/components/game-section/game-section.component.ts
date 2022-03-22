import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeWhile, tap, finalize, map, reduce } from 'rxjs/operators';
import { MathProblem } from 'src/app/interfaces/math-problem';
import { faDeleteLeft, faCircleCheck, faRectangleXmark } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-game-section',
  templateUrl: './game-section.component.html',
  styleUrls: ['./game-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameSectionComponent {

  currentProblem!: MathProblem;

  previousProblems: MathProblem[] = [];

  totalTime = 30;

  num: string = '';

  numPad = [
    {
      value: 0
    },
    {
      value: 1
    },
    {
      value: 2
    },
    {
      value: 3
    },
    {
      value: 4
    },
    {
      value: 5
    },
    {
      value: 6
    },
    {
      value: 7
    },
    {
      value: 8
    },
    {
      value: 9
    },
  ]

  icons = {
    backspace: faDeleteLeft,
    clear: faRectangleXmark,
    enter: faCircleCheck,
  }

  /**
   * subject that notifies when the game is in progress
   */
  gameInProgress$: any = new BehaviorSubject(false)
    .pipe(tap(flag => flag && this.resetGame()));

  /**
   * timer for the game to run, when time runs out then game is over
   */
  timer$ = timer(0, 1000)
    .pipe(
      map(currentTime => this.totalTime - currentTime),
      takeWhile((counter) => counter > 0),
      finalize(() => this.gameInProgress$.next(false))
    )

  problemCounter$: Observable<any> = new BehaviorSubject([])
    .pipe(
      map((arr) => {
        return {
          correct: arr.filter(({isCorrectAnswer}) => isCorrectAnswer).length,
          incorrect: arr.filter(({isCorrectAnswer}) => !isCorrectAnswer).length,
        }
      }),
    );

  constructor(public dialog: MatDialog) {}

  /**
   * generates all the numbers needed to create a math problem
   */
  private createCurrentProblem() {

    const firstNumber = this.randomNumber(1,10);
    const secondNumber = this.randomNumber(1,10);
    const answer = firstNumber + secondNumber;

    this.currentProblem = { firstNumber, secondNumber, answer }
  }

  /**
   * generates a random number between the min-max range, inclusive
   * @param min min number that can be created
   * @param max max number that can be created
   * @returns a rounded number in the range of the min and max, inclusive
   */
  private randomNumber(min: number, max: number) {
    const minRound = Math.ceil(min);
    const maxRound = Math.floor(max);

    return Math.floor(Math.random() * (maxRound - minRound + 1)) + minRound;
  }

  /**
   * resets the previous problems array and model to null
   * and generates new problem
   */
  private resetGame() {
    this.createCurrentProblem();
    this.num = '';
    this.previousProblems = [];
    (this.problemCounter$ as BehaviorSubject<any[]>).next([]);

  }

  /**
   * checks to see if answer is correct, saves result onto current answer,
   * pushes current problem into past problems array,
   * wipes model, and creates a new problem
   */
  nextProblem() {
    const givenAnswer = +this.num;
    const isCorrectAnswer = givenAnswer === this.currentProblem.answer;
    const currentProblem = {...this.currentProblem, isCorrectAnswer, givenAnswer}
    this.previousProblems.push(currentProblem);
    (this.problemCounter$ as any).next(this.previousProblems)

    this.num = '';
    this.createCurrentProblem();
  }

  /**
   * starts the game
   */
  startGame() {
    this.gameInProgress$.next(true)
  }

  type(num: number) {
    this.num = this.num ? this.num + `${num}` : `${num}`
  }

  backspace() {
    this.num = this.num.slice(0,this.num.length - 1);
    console.log(this.num)
  }

  clear() {
    this.num = '';
  }

  openDialog() {
    this.dialog.open(DialogDataExampleDialog, {
      data: {
        animal: 'panda',
      },
    });
  }

}

@Component({
  selector: 'dialog-data-example-dialog',
  template: `
  <h1 mat-dialog-title>Favorite Animal</h1>
  <div mat-dialog-content>
    My favorite animal is:
    <ul>
      <!-- <li>
        <span *ngIf="data.animal === 'panda'">&#10003;</span> Panda
      </li>
      <li>
        <span *ngIf="data.animal === 'unicorn'">&#10003;</span> Unicorn
      </li>
      <li>
        <span *ngIf="data.animal === 'lion'">&#10003;</span> Lion
      </li> -->
    </ul>
  </div>
  <div mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
</div>
`,
})
export class DialogDataExampleDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}