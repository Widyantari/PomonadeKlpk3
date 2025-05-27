import React, { Component } from 'react';
import TypeSelect from '../components/TypeSelect';
import TimeDisplay from '../components/TimeDisplay';
import Controls from '../components/Controls';
import Shortcuts from '../components/Shortcuts';
import ToggleSound from '../components/ToggleSound';
import ToggleTask from '../components/Tasks/TaskToggle';
import TaskList from '../components/Tasks/TaskList';
import './Pomodoro.css';

class Pomodoro extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedType: props.types[0],
      time: props.types[0].time,
      customMinutes: '',
      customSeconds: '',
      interval: null,
      running: false,
      sound:
        JSON.parse(window.localStorage.getItem('pomodoro-react-sound')) || true,
      taskStatus:
        JSON.parse(window.localStorage.getItem('pomodoro-react-taskStatus')) ||
        null
    };
  }

  static defaultProps = {
    types: [
      { name: 'Pomodoro', time: 1500 },
      { name: 'Short Break', time: 300 },
      { name: 'Long Break', time: 900 }
    ]
  };

  componentDidMount() {
    document.addEventListener('keyup', this.handleKeyUp);
    Notification.requestPermission();
    this.sound = new Audio('bell.flac');
    this.sound.preload = 'auto';
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyUp = event => {
    if (event.target.tagName === 'INPUT') return;
    if (event.key === ' ') {
      this.pauseTimer();
    } else if (event.key === 'Escape') {
      this.resetTimer();
    } else if (event.key >= 1 && event.key <= this.props.types.length) {
      this.changeType(this.props.types[event.key - 1]);
    }
  };

  changeType = type => {
    this.resetTimer();
    this.setState({ selectedType: type, time: type.time, running: false, customMinutes: '', customSeconds: '' });
  };

  tick = () => {
    if (this.state.time <= 0) {
      this.stopInterval();
      this.setState({ running: false, time: 0 });
      if (this.state.sound) this.sound.play();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              registration.showNotification(`${this.state.selectedType.name} finished!`);
            } else {
              console.log('Notification permission denied.');
              // Anda bisa menampilkan pesan di UI sebagai alternatif notifikasi di sini
            }
          });
        }).catch(error => console.error('Error registering service worker', error));
      }
      return;
    }
    this.setState(state => ({ time: state.time - 1 }));
  };

  stopInterval = () => {
    clearInterval(this.state.interval);
    this.setState({ interval: null });
  };

  startTimer = () => {
    let initialTime;
    const parsedMinutes = parseInt(this.state.customMinutes, 10);
    const parsedSeconds = parseInt(this.state.customSeconds, 10);

    if (!isNaN(parsedMinutes) || !isNaN(parsedSeconds)) {
      const totalSeconds = (isNaN(parsedMinutes) ? 0 : parsedMinutes) * 60 + (isNaN(parsedSeconds) ? 0 : parsedSeconds);
      if (totalSeconds > 0) {
        initialTime = totalSeconds;
      } else {
        initialTime = this.state.selectedType.time;
      }
    } else {
      initialTime = this.state.selectedType.time;
    }

    this.setState({
      running: true,
      interval: setInterval(this.tick, 1000),
      time: initialTime // Set waktu berdasarkan perhitungan di atas
    });
    this.sound.pause();
    this.sound.currentTime = 0;
  };

  resetTimer = () => {
    this.stopInterval();
    this.setState(state => ({
      time: state.selectedType.time,
      running: false,
      customMinutes: '',
      customSeconds: ''
    }));
  };

  pauseTimer = () => {
    this.state.interval ? this.stopInterval() : this.startTimer();
  };

  getStatus = () => {
    const { time, running, interval } = this.state;
    if (time === 0) return 'Finished';
    if (running && !interval) return 'Paused';
    if (running) return 'Running';
  };

  getProgress = () => {
    const current = this.state.time;
    const total = this.state.selectedType.time;
    return ((total - current) / total) * 100;
  };

  handleToggleSound = () => {
    this.setState(
      state => ({
        sound: !state.sound
      }),
      () => {
        window.localStorage.setItem('pomodoro-react-sound', this.state.sound);
      }
    );
  };

  handleToggleTask = () => {
    this.setState(
      state => ({
        taskStatus: !state.taskStatus
      }),
      () => {
        window.localStorage.setItem(
          'pomodoro-react-taskStatus',
          this.state.taskStatus
        );
      }
    );
  };

  handleCustomTimeChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  render() {
    const { time, selectedType, sound, taskStatus, customMinutes, customSeconds } = this.state;
    const { types } = this.props;

    return (
      <div className="Content">
        <div className="Pomodoro">
          <h1>Pomonade</h1> {/* <-- Tambahkan judul di sini */}
          <h3>Pomodoro Timer App</h3>
          <TypeSelect
            types={types}
            selected={selectedType}
            changeType={this.changeType}
          />
          <div className="custom-time-input">
            <input
              type="number"
              name="customMinutes"
              placeholder="minutes"
              value={customMinutes}
              onChange={this.handleCustomTimeChange}
              min="0"
            />:
            <input
              type="number"
              name="customSeconds"
              placeholder="seconds"
              value={customSeconds}
              onChange={this.handleCustomTimeChange}
              min="0"
              max="59"
            />
          </div>
          <TimeDisplay
            time={time}
            status={this.getStatus()}
            progress={this.getProgress()}
          />
          <Controls
            start={this.startTimer}
            reset={this.resetTimer}
            pause={this.pauseTimer}
            status={this.getStatus()}
          />
          <ToggleTask task={taskStatus} toggleTask={this.handleToggleTask} />
          <Shortcuts />
          <ToggleSound sound={sound} toggleSound={this.handleToggleSound} />
        </div>
        {taskStatus && (
          <div className="TaskPainel">
            <TaskList />
          </div>
        )}
      </div>
    );
  }
}

export default Pomodoro;