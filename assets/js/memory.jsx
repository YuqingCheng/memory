import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col } from 'reactstrap';

export default function run_memory(root) {
  ReactDOM.render(<Memory />, root);
}

class Memory extends React.Component {
  constructor(props) {
    super(props);
    const str = "AABBCCDDEEFFGGHH";
    const letters = [];
    const hide = [];

    //shuffle the letters
    var i, j, temp;
    for(i = 0; i < str.length; i++) {
      letters.push(str.charAt(i));
      hide.push(true);
      j = Math.floor((i+1)*Math.random());
      temp = letters[j];
      letters[j] = letters[i];
      letters[i] = temp;
    }

    this.state = { 
      letters: letters,
      hide: hide,
      count: 0,
      last: null,
      lock: false,
    };

    this.getTile = this.getTile.bind(this);
    this.checkGuess = this.checkGuess.bind(this);
    this.restart = this.restart.bind(this);
  }

  getTile(state, i, j) {
    const index = i*4+j;
    const isHidden = state.hide[index];
    const letter = state.letters[index];
    const lock = state.lock;

    let click = (() => {
      this.checkGuess(i, j);
    });

    const buttonStyle = {
      width: 80,
      height: 80,
      padding: 5,
      fontSize: 36,
    };

    if(isHidden) {
      if(lock) {
        click = null;
      }

      return (<Button color="primary" onClick={click} style={buttonStyle}/>);

    } else {

      return (<Button color="warning" style={buttonStyle}>{letter}</Button>);

    }

  }

  checkGuess(i, j) {
    const index = i*4+j;
    let last = this.state.last;
    const letters = this.state.letters;
    const hide = this.state.hide;

    if(last) {
      const lastIndex = last[0]*4+last[1];
      hide[index] = false;
      hide[lastIndex] = false;
      this.setState({
        hide: hide,
        count: this.state.count+1,
        lock: true,
      });

      if(letters[index] != letters[lastIndex]) {
        setTimeout(() => {
          hide[lastIndex] = true;
          hide[index] = true;
          this.setState({
            hide: hide,
            last: null,
            lock: false,
          });
        }, 1000);
      } else {
        this.setState({
          last: null,
          lock: false,
        });
        let end = true;
        for(var k = 0; k < hide.length; k++) end = end && (!hide[k]);
        if(end) {
          const score = Math.max(0, 116-this.state.count);
          setTimeout(() => {
            alert("Your score: "+score+"\nPlease restart");
          }, 600);
        }
      }
    }else{
      hide[index] = false;
      last = [i, j];
      this.setState({
        hide: hide,
        last: last,
        count: this.state.count+1,
      });
    }
  }

  restart() {
    const str = "AABBCCDDEEFFGGHH";
    const letters = [];
    const hide = [];

    //shuffle the letters
    var i, j, temp;
    for(i = 0; i < str.length; i++) {
      letters.push(str.charAt(i));
      hide.push(true);
      j = Math.floor((i+1)*Math.random());
      temp = letters[j];
      letters[j] = letters[i];
      letters[i] = temp;
    }

    this.setState({ 
      letters: letters,
      hide: hide,
      count: 0,
      last: null,
      lock: false,
    });
  }

  render() {
    const rows = [];
    var i, j;
    const tileStyle = {
      border: 2,
      padding: 0,
      width: 90,
      height: 90,
    };
    for(i = 0; i < 4; i++) {
      const row = [];
      for(j = 0; j < 4; j++) {
        row.push((<Col style={tileStyle}>{this.getTile(this.state, i, j)}</Col>));
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
