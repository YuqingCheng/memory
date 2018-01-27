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
  }

  getTile(state, i, j) {
    const index = i*4+j;
    const isHidden = state.hide[index];
    const letter = state.letters[index];
    const lock = state.lock;

    let click = (() => {
      this.checkGuess(i, j);
    });

    if(isHidden) {
      if(lock) {
        click = null;
      }

      return (<Button color="primary" onClick={click} />);

    } else {

      return (<Button color="warning">{letter}</Button>);

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
      }
    }else{
      hide[index] = false;
      last = [i, j];
      this.setState({
        hide: hide,
        last: last,
      });
    }
  }

  render() {
    const rows = [];
    var i, j;
    for(i = 0; i < 4; i++) {
      const row = [];
      for(j = 0; j < 4; j++) {
        row.push((<Col>{this.getTile(this.state, i, j)}</Col>));
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
      </Container>
    );
  }
}
