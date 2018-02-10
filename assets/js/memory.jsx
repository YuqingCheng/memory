import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col } from 'reactstrap';

export default function run_memory(root, channel) {
  ReactDOM.render(<Memory channel={channel}/>, root);
}

class Memory extends React.Component {
  constructor(props) {
    super(props);
    const channel = props.channel;
    this.state = ({
      letters: [],
      hide: [],
      count: -1,
      last: null,
      lock: false,
    });
    channel.join()
		  .receive("ok", this.updateView.bind(this))
		  .receive("error", resp => { console.log("Unable to join", resp); });

    this.checkGuess = this.checkGuess.bind(this);
    this.restart = this.restart.bind(this);
  }

  updateView(res) {
    console.log("update state", res);
    const state = res.state;
    if(state.last) {
      this.setState({
        letters: state.letters,
        hide: state.hide,
        count: state.count,
        last: state.last,
        lock: false,
      });
    }else{
      this.setState({
        count: state.count,
      });
     setTimeout(() => {
      this.setState({
        letters: state.letters,
        hide: state.hide,
        last: state.last,
        lock: false,
      });
      if(res.state.score) {
        alert("Your score: "+ res.state.score+ "\nPlease restart");
      }

      
     }, 1000);
    } 
  }

  checkGuess(i, j) {
    if(!this.state.lock) {
      const index = i*4+j;
      const channel = this.props.channel;
      const hide = this.state.hide;
      hide[index] = false; 
      if(this.state.last) {
        this.setState({
          lock: true,
          hide: hide,
        });
      }else{
        this.setState({
          hide: hide,
        });
      }
      channel.push("guess", {index: index})
        .receive("ok", (res) => {this.updateView(res);});    
    }
  }

  restart() {
    const channel = this.props.channel;
    channel.push("restart", {})
        .receive("ok", (res) => {this.updateView(res);});   
  }

  render() {
    const rows = [];
    const tileStyle = {
      border: 2,
      padding: 0,
      width: 90,
      height: 90,
    };
    for(var i = 0; i < 4; i++) {
      const row = [];
      for(var j = 0; j < 4; j++) {
        row.push(
          (<Col style={tileStyle}>
            <Tile state={this.state} i={i} j={j} checkGuess={(i, j) => this.checkGuess(i, j)} lock={this.state.lock}/>
          </Col>)
        );
      }
      rows.push((<Row>{row}</Row>));
    }

    return (
      <Container>
        <Row>
          <Col sm="12" md={{size: 6, order: 2, offset: 1}}>
            <Container>
              {rows}
            </Container>
          </Col>
        </Row>
        <Row>
          <Col md="6">{"You have clicked "+this.state.count+" times. "}</Col>
          <Col md="6">
            <Button color="info" onClick={this.restart}>Restart</Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

class Tile extends React.Component {

  render() {
    const i = this.props.i;
    const j = this.props.j;
    const state = this.props.state;

    const index = i*4+j;
    const isHidden = state.hide[index];
    const letter = state.letters[index];
    const lock = this.props.lock;

    let click = (() => {
      this.props.checkGuess(i, j);
    });

    const buttonStyle = {
      width: 80,
      height: 80,
      padding: 5,
      fontSize: 36,
    };

    if(isHidden) {
      return (<Button color="primary" onClick={click} style={buttonStyle}/>);
    } else {
      return (<Button color="warning" style={buttonStyle}>{letter}</Button>);
    }
  }
}
