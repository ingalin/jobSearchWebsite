import { Component } from 'react';
import parse from 'html-react-parser';
import firebase from './firebase';


class NewJob extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            itemInWishList: false,
            itemAlreadyInList: false, 
            idWishlist: '',
            titleWishlist: '',
            companyWishlist: '',
            jobUrlWishlist: '',
        }
    }


    // Add a job to Wish List Firebase
    addToWishlist(thisId, jobTitle, company, jobUrl) {
        if (!company || company === "" || company.slice(-1) === "]") {company = ""}
        if (!jobTitle || jobTitle === "") { jobTitle = "---" }
        if (!jobUrl || jobUrl === "") { jobUrl = `<a href="#"></a>` }
            this.setState({
                idWishlist: thisId,
                titleWishlist: jobTitle, 
                companyWishlist: company,
                jobUrlWishlist: jobUrl,
                itemInWishList: false,
                itemAlreadyInList: false
            }, () => {
                    // Check if the job is already on the Wish list
                    const ref = firebase.database().ref(`${this.props.passUserId}`);
                    ref.once("value")
                        .then((snapshot) => {
                            let itemIsAlreadyInWishlist = snapshot.child(`${idWishlist}`).exists();
                            //true or false
                            // Show a message if job was added or is already on the list, hide after a while
                            if (itemIsAlreadyInWishlist) {
                                this.setState({
                                    itemAlreadyInList: true
                                });
                                setTimeout(() => {
                                    this.setState({
                                        itemAlreadyInList: false
                                    });
                                }, 2000);
                            }
                            else {
                                this.setState({
                                    itemInWishList: true
                                });
                                setTimeout(() => {
                                    this.setState({
                                        itemInWishList: false
                                    });
                                }, 2500);
                            }
                        });
                    // If id exists in Firebase, don't add new item
                    const { idWishlist, titleWishlist, companyWishlist, jobUrlWishlist } = this.state;
                    const firebaseRef = firebase.database().ref(`${this.props.passUserId}`).child(idWishlist);
                    firebaseRef.set({
                        jobKey: idWishlist,
                        jobTitle: titleWishlist,
                        company: companyWishlist,
                        jobUrl: jobUrlWishlist,
                    });
                });
    }

    // Show more info on button click
    showData(showThisId) {
        this.setState({
            visible: !this.state.visible,
            idCliked: showThisId
        });
    }

    render() {
        const { keyId, jobTitle, company, category, time, description, jobUrl, contract, classIndex } = this.props;
        return (
            <div className={classIndex} >
                {/* Show message if item was added or is already on the list */}
                <div className="wishListManage">
                    {this.state.itemInWishList ? <h6>item added</h6> : null}
                    {this.state.itemAlreadyInList ? <h6>item is already on list</h6> : null}
                </div>
                {/* Use PARSE to avoid <strong> tags comming from API */}
                {/* Ensure that fields exist */}
                {/* Adjust empty fields */}
                {/* If category is Unknown, don't show it on the page */}
                <div className="jobDescription">
                    <div className="title">
                        {jobTitle && jobTitle !== "" ? <h2>{parse(jobTitle)}</h2> : <h2>Other Jobs</h2>}
                        {category !== "Unknown" && category && category !== "" ? <h5>{parse(category)}</h5> : null}
                    </div>
                    <div className="company">
                        {company && company !== "" && company.slice(-1) !== "]" ? <h3>{parse(company)}</h3> : null}
                        {contract && contract !== "" ? <h4>{parse(contract)}</h4> : null}
                    </div>
                    <div className="buttonsInfo">
                        {/* Show/Hide Description on Button Click */}
                        <button className="showDetails" onClick={() => this.showData(keyId)}>{this.state.visible ? 'Hide Details' : 'Show Details'}</button>
                        {/* Add to Wish List Button, show onl when logged in, otherise a message */}
                        {(this.props.passUserId != null ? <button className="saveForLater" onClick={() => this.addToWishlist(keyId, jobTitle, company, jobUrl)}>Save</button> : <button className="saveForLater disabledButton" disabled>Sign In to save</button> )}
                    </div>
                </div>
                {this.state.visible && this.state.idCliked === keyId ? 
                <div className="description">
                    <div>
                        {description && description !== "" ? <p>{parse(description)}</p> : <p>No Description</p>}
                        {time && time !== "" ? <time dateTime={time.split('T')[0]}>Date Created: {time.split('T')[0]}</time> : null}
                    </div>
                        {jobUrl && jobUrl !== "" ? <a href={jobUrl}>Read More & Apply</a> : null }
                </div> : null}
            </div>
        )
    }
}

export default NewJob;