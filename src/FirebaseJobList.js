import { Component } from 'react';
import firebase from './firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import parse from 'html-react-parser';

class FirebaseJobList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataFromFirebase: []
        }
    }


    // Get data from Firebase when log in changes
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.passUserId !== this.props.passUserId ) {
            // Get current Wish List
            // Variable that holds a reference to our database
            const dbRef = firebase.database().ref(`${this.props.passUserId}`);
            dbRef.on('value', (response) => {
                // store the new state we want to introduce to our app
                const firebaseData = [];
                // response from our query to Firebase inside of a variable .val() 
                const data = response.val();
                // data is an object, so we iterate through it using a for in loop to access each job, push each job to an array
                for (let key in data) {
                    firebaseData.push({ key: key, dataFirebase: data[key] });
                }
                this.setState ({
                    dataFromFirebase: firebaseData
                });
            });
        }
    }

    // remove Job from Wish List
    removeJobFromWishlist = (id) => {
        // create a reference to the database 
        const dbRef = firebase.database().ref(`${this.props.passUserId}`);
        // using the Firebase methods .child(). & remove(), we remove the node specific to the event
        dbRef.child(id).remove();
    }
    

    render() {
        return (
            <ul className="wishList">
                {/* MAP through the array and display each Wish List Job */}
                {this.state.dataFromFirebase.map((eachWishlistJob) => {
                    return (
                        <li className="eachWish" key={eachWishlistJob.key}>
                            <div className="closeButtonWish">
                                <button className="removeFromWishlist" onClick={() => this.removeJobFromWishlist(eachWishlistJob.key)} aria-label="Close sign in form"><FontAwesomeIcon icon={faTimesCircle} /></button>
                            </div>
                            {eachWishlistJob.dataFirebase.jobTitle && eachWishlistJob.dataFirebase.jobTitle !== "" ? <h2>{parse(eachWishlistJob.dataFirebase.jobTitle)}</h2>  : <h2>---</h2>}
                            {eachWishlistJob.dataFirebase.company && eachWishlistJob.dataFirebase.company !== "" ? <h3>{parse(eachWishlistJob.dataFirebase.company)}</h3> : <h3>---</h3>}
                            {eachWishlistJob.dataFirebase.jobUrl && eachWishlistJob.dataFirebase.jobUrl !== "" ? <a href={eachWishlistJob.dataFirebase.jobUrl}>Apply Here</a> : <p>---</p>}
                        </li>
                    );
                })
                }
            </ul>
        )
    }
}

export default FirebaseJobList;