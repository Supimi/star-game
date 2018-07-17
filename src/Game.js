import React, {Component} from 'react';
import './Game.css';
import _ from 'lodash';

const Stars = (props) => {
    
    // const stars=[];

    // for(var i=0;i<numOfStars;i++){
    //     stars.push( <i key={i} className="fa fa-star"/> );
    // }

    return(
        <div className="col-5">
            {_.range(props.numOfStars).map((star) => 
                <i key={star} className="fa fa-star"/> 
            )}
        </div>
    );
};

const Button = (props) => {
    let button;

    switch(props.isAnswerCorrect){
        case true:
            button =  <button className="btn btn-success" onClick={() => props.acceptAnswer()} >
            <i className="fa fa-check"></i></button>;
            break;
        case false:
            button =  <button className="btn btn-danger" >
            <i className="fa fa-times"></i></button>;
           break;

        default:
            button = <button className="btn btn-info" disabled={props.selectedNumbers.length === 0 } onClick={ () => props.checkAnswer()}>
            =</button>;

    }

    return(
        <div className="col-2">
            {button}
        <br/>
        <br/>
        <button className="btn btn-warning btn-sm" onClick={() => {props.redrawStars()}}>
            <i className="fa fa-refresh"></i>
            {props.redraws}
        </button>
        </div>
       
    );
};

const Answer = (props) => {
    return(
        <div className="col-5">
            {props.selectedNumbers.map((number,i) =>  <span key={i} onClick={() => props.unSelectNumber(number)}>{number}</span>)}
        </div>
    );
};

const Numbers = (props) => {
    
    const spanClassName = (num) => {
        if(props.usedNumbers.indexOf(num)>=0){
            return 'used';
        }

        if(props.selectedNumbers.indexOf(num)>=0){
            return 'selected';
        }
    }

    return(
        <div className="card text-align">
            <div>
                {Numbers.list.map((number,i) => 
                    <span key={i} className={spanClassName(number)} onClick={()=> props.selectNumber(number)}>{number}</span>
                )}
            </div>
        </div>
    );
};

const GameStatus = (props) => {
    return(
        <div>
            <hr/>
            {props.gamestatus}
            <br/>
            <br/>
            <button className="btn btn-default" onClick={() => props.restart()}> Play Again!</button>
        </div>
    );
};

const StartGame = (props) => {
    return(
        <div>
            <h5 className="game-title">{props.timeOut? "You unable to play the game within 1 minute": "Let's have fun with Play Nine!!"}</h5>
            <br/><br/>
            <button onClick={() => props.startGame()}> Start Game </button>
        </div>
    );
}

Numbers.list=_.range(1,10);

class Game extends Component{
    static numOfStars = () => 1+Math.floor(Math.random()*9 );
    static intialState = () => ({
        selectedNumbers:[],
        numOfStars : Game.numOfStars(),
        isAnswerCorrect: null,
        usedNumbers:[],
        redraws:10,
        gameStatus:null,
        startTime:null,
        timeOut:false,
    });
    
    state=Game.intialState();

    selectNumber = (clickedNumber) => {
        if(!this.state.selectedNumbers.includes(clickedNumber) && !this.state.usedNumbers.includes(clickedNumber)){
            this.setState(prevState => ({
                isAnswerCorrect:null,
                selectedNumbers:prevState.selectedNumbers.concat(clickedNumber)
        }));
        }
        
    }

    unSelectNumber = (clickedNumber) => {
        this.setState(prevState => ({
            isAnswerCorrect:null,
            selectedNumbers:prevState.selectedNumbers.filter(number => number!==clickedNumber)
        }))

    }

    checkAnswer = () => {
        this.checkTimeOut();
        if(!this.state.timeOut){
            const total = this.state.selectedNumbers.reduce((a,b) => a+b,0);
        if(this.state.numOfStars === total){
            this.setState({isAnswerCorrect:true});
            console.log("Your answer is correct");
            
        }
        else{
            this.setState({isAnswerCorrect:false});
            console.log("Your answer is incorrect");
        }
        }
    }

    acceptAnswer =() => {
        this.setState(prevState => ({
            usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
            isAnswerCorrect:null,
            selectedNumbers:[],
            numOfStars : Game.numOfStars()
        }),this.updateGameStatus);
        console.log("used numbers",this.state.usedNumbers.length,this.state.usedNumbers);

    }

    redrawStars = () => {
        this.checkTimeOut();
        console.log(this.state.redraws);
        if(this.state.redraws>0){
            this.setState(prevState =>({ 
                numOfStars : Game.numOfStars(),
                redraws:prevState.redraws - 1
            }),this.updateGameStatus);
        }
    }

    possibleSolutions = ({numOfStars,usedNumbers}) => {
        const possibleNumbers = _.range(1,10).filter(number => usedNumbers.indexOf(number) === -1);
        if(possibleNumbers.includes(numOfStars)){
            return true;
        }
        const combinationsums = this.combinationSums(possibleNumbers,2);
        if(combinationsums.includes(numOfStars)){
            return true;
        }
        else{
            return false;
        }


    }

    combinationSums = (a, min) => {
        var fn = (n, src, got, all) => {
            if (n === 0) {
                if (got.length > 0) {
                    all[all.length] = got;
                }
                return;
            }
            for (var j = 0; j < src.length; j++) {
                fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
            }
            return;
        }
        var all = [];
        var sums =[];
        for (var i = min; i < a.length; i++) {
            fn(i, a, [], all);
        }
        all.push(a);

        for(var j=0;j<all.length;j++){
            sums.push(all[j].reduce(this.getSum));
        }

        return sums;
    };

    getSum = (total, num) => {
        return total + num;
    }

    updateGameStatus = () => {
        this.setState(prevState => {
            if(prevState.usedNumbers.length ===9){
                return { gameStatus: "You've completed the game!"};
    
            }

            if(prevState.redraws===0 && !this.possibleSolutions(prevState)){
                return { gameStatus: "Game Over!"};
    
            }
        });

        

    };

    reStartGame = () => {
        this.setState(Game.intialState());
        this.setState({startTime:new Date()});

    }

    checkTimeOut = () => {
        var timeDifference = new Date() - this.state.startTime;
        console.log(timeDifference);
        if(timeDifference>60000){
            this.setState({timeOut:true});
            alert("You should complete the game within 1 minute");

        }
    }
       
    render(){
        const { selectedNumbers ,numOfStars, isAnswerCorrect, usedNumbers, redraws,gameStatus,startTime,timeOut} =this.state;
        return(
            <div className="container">
                <h2>Play Nine</h2>
                <hr/>
                { startTime && !timeOut? 
                    <div className="row">
                    <Stars numOfStars={numOfStars}/>
                    <Button selectedNumbers={selectedNumbers} checkAnswer={this.checkAnswer} isAnswerCorrect={isAnswerCorrect} acceptAnswer={this.acceptAnswer} redrawStars={this.redrawStars} redraws={redraws}/>
                    <Answer selectedNumbers={selectedNumbers} unSelectNumber={this.unSelectNumber}/>
                    { gameStatus? <GameStatus gamestatus={gameStatus} restart={this.reStartGame}/>:
                    <Numbers selectedNumbers={selectedNumbers} usedNumbers={usedNumbers} selectNumber={this.selectNumber}/>
                    }
                </div>:
                <StartGame startGame={this.reStartGame} timeOut={timeOut}/>
                }
                
            </div>
        );
    }
}

export default Game;