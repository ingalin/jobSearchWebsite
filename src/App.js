import './App.css';
import { Component } from 'react';
import axios from "axios";
import NewJob from "./NewJob";
import Select from 'react-select';
import FirebaseJobList from './FirebaseJobList';
import firebase from './firebase';
import NewUserForms from './NewUserForms';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';


class App extends Component {
  constructor() {
    super();
    this.state = {
      // Error messages
      errorMessage: '',
      showErrorMessage: false,
      noFieldsErrorMessage: false,
      showPageCount: true,
      // Response data
      countryList: [],
      allJobs: [],
      selectedOption: { value: '', label: 'All Toronto Area', count: 1, pageNum: 1 },
      // Keyword values
      value: '', // Current keyword chosen
      keywordsConverted: '',
      previousKeywords: '',
      showEnteredKeywords: false,
      // Page Count
      pageCount: '',
      maxPageCount: 1,
      // Next/Previous buttons
      nextButtonDisabled: false,
      prevButtonDisabled: false,
      // User Logged In
      usersEmail: '',
      signedOut: false,
      errorLogOut: false,
    }
    // Dropdown menu Bind
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  //Start by loading all the newest jobs in all Toronto areas
  componentDidMount() {
    // onAuthStateChanged method.When a user successfully signs in, get information about the user in the observer.
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        this.setState({
          userLoggedIn: uid,
          usersEmail: user.email
        });
        // ...
      } else {
        this.setState({
          signedOut: true
        })
      }
    });
    // Get the list of all Toronto areas and upload them to the array to use for the dropdown menu
    axios({
      method: "GET",
      url: `https://api.adzuna.com/v1/api/jobs/ca/geodata?app_id=18a606b4&app_key=35897d0612c0636126c9cdeddc06f44d&location0=Canada&location1=Ontario&location2=Toronto`,
      responseType: "json",
    }).then((response) => {
      // Push data into areaArray, Toronto All is default
      const areaArray = [{ value: '', label: 'All Toronto Area', count: 1, pageNum: 1 }];
      for (let i = 0; i < response.data.locations.length; i++){
        areaArray.push({ value: response.data.locations[i].location.area[3].replaceAll(" ", "%20").replace(/^/, '&location3='), label: response.data.locations[i].location.display_name, count: response.data.locations[i].count, pageNum: 1 })
      }
      this.setState({
        countryList: areaArray
      });
    }).catch(err => {
      // Show Error message if no data is retrieved
      this.setState({ 
        errorMessage: err.message,
        showErrorMessage: true,
        showPageCount: false
      });
    });
      // Show data for all Toronto areas
      axios({
        method: "GET",
        url: `https://api.adzuna.com/v1/api/jobs/ca/search/1?app_id=18a606b4&app_key=35897d0612c0636126c9cdeddc06f44d&results_per_page=50&location0=Canada&location1=Ontario&location2=Toronto&sort_by=date`,
        responseType: "json",
      }).then((response) => {
          this.setState({
            selectedOption: {
              ...this.state.selectedOption,
              count: response.data.count
            }
          })
      }).catch(err => {
        // Show Error message if no data is retrieved
        this.setState({ 
            errorMessage: err.message,
            showErrorMessage: true,
            showPageCount: false
          });
      });
  }


  // New search if a value is selected from dropdown, keywords changed or next/previous page
    componentDidUpdate(prevProps, prevState) {

      // Do the update only when the previous/current state items don't match
      if ((this.state.selectedOption !== prevState.selectedOption) || (this.state.keywordsConverted !== prevState.keywordsConverted)) {
        // Do AXIOS every time the area, search keywords are changed or next/previous page
        axios({
          method: "GET",
          url: `https://api.adzuna.com/v1/api/jobs/ca/search/${this.state.selectedOption.pageNum}?app_id=18a606b4&app_key=35897d0612c0636126c9cdeddc06f44d&results_per_page=50${this.state.keywordsConverted}&location0=Canada&location1=Ontario&location2=Toronto${this.state.selectedOption.value}&sort_by=date`,
          responseType: "json",
        }).then((response) => {
          // Add classes to every object for styling
          const jobsSelected = response.data.results;
          for(let i=0; i < jobsSelected.length; i++){
            if (i % 2 === 0) {
              jobsSelected[i].class = "jobListing classOne";
            }
            else {
              jobsSelected[i].class = "jobListing classTwo";
            }
          }
          // Update Job list and page count// Show Page Count; hide error messages
          this.setState({
            allJobs: jobsSelected,
            keywordCountValue: response.data.count,
            showPageCount: true,
            noFieldsErrorMessage: false,
          });
          // Deactivate Previous button if one page
          if ((this.state.selectedOption.pageNum) == "1") {
            this.setState({
              prevButtonDisabled: true
            })
          }
          // Run Page Count update function
          this.pageCountFunc();
          // Activate Next button if more than 1 page
          if (this.state.maxPageCount > 1) {
            this.setState({
              nextButtonDisabled: false
            })
          }
          // If max page number reached, disable Next button
          if (this.state.selectedOption.pageNum == this.state.maxPageCount) {
            this.setState({
              nextButtonDisabled: true,
            })
          }
          // Show error message when no data retrieved
          if (response.data.count == 0) {
            this.setState({
              noFieldsErrorMessage: true,
              showPageCount: false
            })
          }
        }).catch(err => {
          // Show error if AXIOS didn't work
          this.setState({ 
            errorMessage: err.message,
            showErrorMessage: true,
            showPageCount: false
          });
        });
      }
    }



  // Handle Dropdown Menu change
  handleChange = selectedOption => {
    this.setState({ 
      selectedOption 
    });
  };

  // On Keyword Input field Change target the state
  handleChangeForm=(event)=> { 
    this.setState({ 
      value: event.target.value
    }); 
  }

  // On Keyword Form Submit:
  handleSubmit = (event)=> {
    // Prevent Default
    event.preventDefault();
    // Check if the field is not empty. 
    // If it's not empty, create a field for API call and a field for comparison; empty the input; update starting page count
    if (this.state.value !== "") {
      this.setState({ 
        keywordsConverted: this.state.value.replaceAll(" ", "%20").replace(/^/, '&what='), 
        previousKeywords: this.state.value, 
        value: '',
        showEnteredKeywords: true,
        selectedOption: {
          ...this.state.selectedOption,
            pageNum: 1
        }
      })
    }
  }

  // Remove keywords button (update all fields, clear values)
  removeKeywords = (event) => {
    // Prevent Default
    event.preventDefault();
    this.setState({
      value: '',
      keywordsConverted: '',
      previousKeywords: '',
      showEnteredKeywords: false,
      selectedOption: {
        ...this.state.selectedOption,
          pageNum: 1
      }
    })
  }

  // Count pages (depending if keywords are entered or no keywords use different setState vales)
  pageCountFunc = ()=>{
    if (this.state.keywordCountValue > 0){
      this.setState({
        maxPageCount: Math.ceil(this.state.keywordCountValue / 50)
      })
    }
    else {
      this.setState({
        maxPageCount: Math.ceil(this.state.selectedOption.count / 50)
      })
    }
  }

  // Next Page Button
  nextPage = (event) => {
    // Prevent Default
    event.preventDefault();
    // Show Previous button
    this.setState({
      prevButtonDisabled: false
    })
    // Update page numbers
    if ((this.state.selectedOption.pageNum + 1) <= this.state.maxPageCount) {
      this.setState(prevState => ({
        selectedOption: {
          ...prevState.selectedOption,
          pageNum: this.state.selectedOption.pageNum + 1 
        }
      }))
    }
  }

  // Previous Page Button
  previousPage = (event) => {
    // Prevent Default
    event.preventDefault();
    // Show NEXT button
    this.setState({
      nextButtonDisabled: false
    })
    // Update page numbers
    if ((this.state.selectedOption.pageNum - 1) > 0){
      this.setState(prevState => ({
        selectedOption: {
          ...prevState.selectedOption,
          pageNum: this.state.selectedOption.pageNum - 1
        }
      }))
    }
  }

  // Reload page if error
  reloadPage = () => {
    window.location.reload();
  }

  // Log Out
  logOut = () => {
    firebase.auth().signOut().then(function () {
      // Sign-out successful.
      window.location.reload();
    }).catch(function (error) {
      // An error happened.
      this.setState({
        errorLogOut: true,
        usersEmail: ''
      });
    });
  }

  // Display data
  render() {
    return (
      <div className="App">
        {/* Show error message if AXIOS didn't work, button to reload the page */}
        {this.state.showErrorMessage && <div className="blockView">
          <div className="error">
            <h6>Sorry... Something went wrong, not all data can be retrieved.</h6>
            <button onClick={this.reloadPage}>Try again!</button>
            <p>{this.state.errorMessage}</p>
          </div>
        </div>}
        <header>
              <div className="wrapper">
                <div className="logIn">
                  {/* <NewUserForms /> */}
                  {/* Log In / Add New User forms */}
                  <h1>Find Your Job In Toronto</h1>
                  <div className="logInFields">
                    {/* User Logged In */}
                    {this.state.usersEmail ? <h5 className="signIn">Logged in as {this.state.usersEmail}</h5> : null}
                    {this.state.errorLogOut && <h5 className="signIn">Log Out failed!</h5>}
                    {/* Log In */}
                    {!this.state.usersEmail && <h5 className="signIn">Sign In</h5>}
                    {!this.state.usersEmail ? <NewUserForms /> : null}
                    {/* Log Out */}
                    {this.state.usersEmail ? <button type="submit" className="logOut" onClick={this.logOut} aria-label="Log out"><FontAwesomeIcon icon={faPowerOff} size="2x" /></button> : null}
                  </div>
                </div>
                <div className="searchFields">
                  <div className="citySearch">
                  {/* Using react-select package for the dropdown menu */}
                    <Select
                      value={this.state.selectedOption}
                      onChange={this.handleChange}
                      options={this.state.countryList}
                      theme={theme => ({
                        ...theme,
                        borderRadius: 5,
                        colors: {
                          ...theme.colors,
                          primary25: '#efa50e',
                          primary: '#4e007a',
                        }
                      })}
                    />
                    {/* Next/Previous buttons (hidden if 0 search results)*/}
                      {this.state.showPageCount &&
                        <div className="nextPrevButtons">
                          <button type="submit" onClick={this.previousPage} disabled={this.state.prevButtonDisabled} aria-label="previous page"><FontAwesomeIcon icon={faArrowAltCircleLeft} aria-hidden="true" /></button>
                          <p className="pageCount">{`${this.state.selectedOption.pageNum} of ${this.state.maxPageCount}`} </p>
                          <button type="submit" onClick={this.nextPage} disabled={this.state.nextButtonDisabled} aria-label="Next page"><FontAwesomeIcon icon={faArrowAltCircleRight} aria-hidden="true" /></button>
                        </div>}
                  </div>
                  {/* Search by keywords form */}
                  <div className="keywords">
                    <form className="keywordForm">
                      <label htmlFor="searchBy" className="srOnly">Search by job title, keywords, or company</label>
                      <input id="searchBy" type="text" value={this.state.value} onChange={this.handleChangeForm} placeholder="Job title,  keywords, or company"/>
                      <button type="submit" onClick={this.handleSubmit} aria-label="Search"><FontAwesomeIcon icon={faSearch} size="2x" /></ button>
                    </form>
                    <div className="keywordsDiv">
                      {this.state.showEnteredKeywords && <div className="searchOptions">
                        <p>Current search by: "{(this.state.previousKeywords)}"</p>
                        <button type="submit" onClick={this.removeKeywords}>Clear Keywords</button>
                      </div>}
                    </div>
                  </div>
                </div>
              </div>
          </header>
          {/* New Job list items // Imported from NewJob.js */}
          <main className="wrapper">
            {/* Show error message if no search results */}
            <section>
              {this.state.noFieldsErrorMessage && <div className="errorNoResults"><h6>No Search Results, please try again!</h6></div>}
              <ul>
                {
                  this.state.allJobs.map((eachJob) => {
                    return (
                      <li key={eachJob.id}>
                        <NewJob passUserId={this.state.userLoggedIn} 
                          keyId={eachJob.id}
                          jobTitle={eachJob.title}
                          company={eachJob.company.display_name}
                          contract={eachJob.contract_type}
                          category={eachJob.category.label}
                          time={eachJob.created}
                          description={eachJob.description}
                          jobUrl={eachJob.redirect_url}
                          classIndex={eachJob.class}
                          inFirebase={eachJob.itemInFirebase}
                        />
                      </li>
                    );
                  })
                }
              </ul>
            </section>
            <aside>
              {!this.state.userLoggedIn && <h5>Log In To Add Items To Wish List</h5>}
              {this.state.userLoggedIn && <h5>Saved Jobs</h5>}
              <FirebaseJobList passUserId={this.state.userLoggedIn} passSelectedOption={this.state.selectedOption} passKeywordsConverted={this.state.keywordsConverted} />
            </aside>
        </main>
      </div>
    );
  }
}
export default App;