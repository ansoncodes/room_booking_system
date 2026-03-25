import Header from "./components/Header";
import CheckAvailability from "./components/CheckAvailability";
import BookRoom from "./components/BookRoom";
import "./App.css";

const App = () => {
    return (
        <div>
            <Header />
            <div className="app-container">
                <CheckAvailability />
                <BookRoom />
            </div>
        </div>
    );
};

export default App;
