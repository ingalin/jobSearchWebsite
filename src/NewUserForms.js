import { Component } from 'react';
import firebase from './firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';


class NewUserForms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // New User
            email: '',
            password: '',
            passwordConfirm: '',
            // Log In
            email2: '',
            password2: '',
            // Error messages
            passwordsSame: true,
            errorMessage: '',
            signedOut: false,
            errorLogIn: false,
            showLogInForm: false,
            showRegister: false,
        }
    }

    // Enter New User
    handleChangeNewUser = (event) => {
        // Hide error messages
        this.setState({
            passwordsSame: true,
            errorMessage: ''
        });
        // store event.target.value in a constant
        const value = event.target.value;
        this.setState({
            // target each propery by the input's id and set it to the value stored in the constant
            [event.target.id]: value
        });
    }

    // Submit New User
    handleSubmitNewUser = (event) => {
        event.preventDefault();
        // Check if passwords are same, create a new user or show an error
        if (this.state.password === this.state.passwordConfirm) {
            firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then((user) => {
                    this.setState({
                        email: '',
                        password: '',
                        passwordConfirm: '',
                        showRegister: false
                    });
                })
                .catch((error) => {
                    // Use this error code for extra info:
                    // const errorCode = error.code;
                    this.setState({
                        errorMessage: error.message,
                        showRegister: true,
                    });
                });
        }
        else {
            this.setState({
                passwordsSame: false
            });
        }
    }

    // Log In field change
    handleChangeLogIn = (event) => {
        // store event.target.value in a constant
        const value = event.target.value;
        this.setState({
            // target each propery by the input's id and set it to the value stored in the constant
            [event.target.id]: value,
            errorLogIn: ''
        });
    }

    // Log in submit
    handleSubmitLogIn = (event) => {
        event.preventDefault();
        firebase.auth().signInWithEmailAndPassword(this.state.email2, this.state.password2)
            .then((user) => {
                this.setState({
                    email2: '',
                    password2: '',
                });
            })
            .catch((error) => {
                // Use this error code for extra info:
                // const errorCode = error.code;
                this.setState ({
                    errorLogIn: error.message
                });
            });
    }

    // Show Log in/register forms
    showLogIn = (event) => {
        event.preventDefault();
        this.setState({
            showLogInForm: true
        });
    }

    // Hide Log in/Register forms
    hideForms = (event) => {
        event.preventDefault();
        this.setState({
            showLogInForm: false,
            showRegister: false,
            errorMessage: '',
            errorLogIn: '',
            passwordsSame: true,
            email: '',
            password: '',
            passwordConfirm: '',
            email2: '',
            password2: '',
        });
    }

    // Show Register form
    showRegister = (event) => {
        event.preventDefault();
        this.setState({
            showRegister: true,
            email2: '',
            password2: '',
            errorLogIn: ''
        });
    }

    // Show Register form
    cancelRegister = (event) => {
        event.preventDefault();
        this.setState({
            showRegister: false,
            errorMessage: '',
            passwordsSame: true,
            email: '',
            password: '',
            passwordConfirm: '',
        });
    }


    render() {
        return (
            <div>
                {/* Button to show Log In form */}
                <button type="submit" onClick={this.showLogIn} aria-label="Sign In"><span>Sign In</span> to save<FontAwesomeIcon icon={faSignInAlt} size="1x" /></button>
                {this.state.showLogInForm && <div className="registerFields">
                    {/* Hide Log In */}
                    <button type="submit" onClick={this.hideForms} className="closeForm" aria-label="Close sign in form"><FontAwesomeIcon icon={faTimesCircle} size="1x" /></button>
                    {/* Sign In form */}
                    <h2>Sign In</h2>
                    {!this.state.showRegister && <div><form onSubmit={this.handleSubmitLogIn} aria-live="polite">
                        {/* // On change run the function to update the state */}
                        <label htmlFor="email2" className="srOnly">Email Address</label>
                        <input type="email" id="email2" name="inputForm2" value={this.state.email2} placeholder="Email Address" required onChange={this.handleChangeLogIn} />

                        <label htmlFor="password2" className="srOnly">Password</label>
                        <input type="password" id="password2" name="inputForm2" value={this.state.password2} placeholder="Password" required onChange={this.handleChangeLogIn} />

                        <button type="submit" className="registerButtons">Sign In</button>
                    </form>
                    <p>Not a user yet?</p>
                    <button type="submit" onClick={this.showRegister} className="registerButtons">Register New User</button></div>}
                    {/* Register form */}
                    {this.state.showRegister && <div><form onSubmit={this.handleSubmitNewUser} aria-live="polite">
                        {/* // On change run the function to update the state */}
                        <label htmlFor="email" className="srOnly">Email Address</label>
                        <input type="email" id="email" name="inputForm" value={this.state.email} placeholder="Email Address" required onChange={this.handleChangeNewUser} />

                        <label htmlFor="password" className="srOnly">Password</label>
                        <input type="password" id="password" name="inputForm" value={this.state.password} placeholder="Password" required onChange={this.handleChangeNewUser} />

                        <label htmlFor="passwordConfirm" className="srOnly">Confirm Password:</label>
                        <input type="password" id="passwordConfirm" name="inputForm" value={this.state.passwordConfirm} placeholder="Confirm Password" required onChange={this.handleChangeNewUser} />

                        <button type="submit" className="registerButtons">Create User & Log In</button>
                    </form>
                 
                    </div>}
                    {/* Error messages on Register or Log In */}
                    <div className="logInErrors">
                        {!this.state.passwordsSame && <h6>Password doesn't match!</h6>}
                        {this.state.errorMessage !== '' && <h6>{this.state.errorMessage}</h6>}
                        {this.state.errorLogIn && <h6>{this.state.errorLogIn}</h6>}
                    </div>
                    <button type="submit" onClick={this.cancelRegister} className="return">Go Back</button>
                </div>}

            </div>
        )
    }
}

export default NewUserForms;