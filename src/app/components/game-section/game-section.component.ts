import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, interval, timer } from 'rxjs';
import { scan, takeWhile, tap, finalize, map } from 'rxjs/operators';
import { MathProblem } from 'src/app/interfaces/math-problem';

@Component({
  selector: 'app-game-section',
  templateUrl: './game-section.component.html',
  styleUrls: ['./game-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameSectionComponent {

  currentProblem!: MathProblem;

  previousProblems: MathProblem[] = [];

  model: any = null;

  totalTime = 30;

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
    this.model = null;
    this.previousProblems = [];
  }

  /**
   * checks to see if answer is correct, saves result onto current answer,
   * pushes current problem into past problems array,
   * wipes model, and creates a new problem
   */
   nextProblem() {
    const isCorrectAnswer = this.model === this.currentProblem.answer;
    const currentProblem = {...this.currentProblem, isCorrectAnswer}
    this.previousProblems.push(currentProblem);

    this.model = null;
    this.createCurrentProblem();
  }

  /**
   * starts the game
   */
  startGame() {
    this.gameInProgress$.next(true)
  }

}