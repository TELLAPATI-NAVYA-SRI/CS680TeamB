import React  from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


import Navigation from './components/navigation';
import Footer from './components/footer';
import Landing from './components/landing';
import Explore from './components/explore';
import MotelDetail from './components/motelDetail';
import Signup from './components/signUp';
import ReviewPage from './components/reviewPage';

function App() {
  

  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/motel/:id" element={<MotelDetail />} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/reviewPage/:id" element = {<ReviewPage/>}/>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
