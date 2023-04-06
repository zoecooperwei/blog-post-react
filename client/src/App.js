import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './assets/fontawesome/css/fontawesome.css';
import './assets/fontawesome/css/brands.css';
import './assets/fontawesome/css/solid.css';
import './assets/fontawesome/css/regular.css';
import './css/mdb.min.css';
import { Outlet } from "react-router-dom";

function App() {
    return (
        <div className="App">
            <Outlet />
        </div>
    );
}

export default App;
