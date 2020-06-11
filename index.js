import React from 'react'
import {Button, Alert } from 'reactstrap';
import Link from 'next/link'
import NavSection from '../components/authNav.js';
const env = require('../components/baseUrl.json');
import axios from 'axios';
import qs from 'qs';
import { isNull } from 'util';


class Dashboard extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      createSectionsName: '',
      courseNumber: '',
      listOfCourses: [],
      listOfSections: [],
      copyListOfSections: [],
      selectedCourseId: '',
      selectedCourseIndex: '',
      showCreateCourse: false,
      showCreateSection: false,
    }

    this.createCourse = this.createCourse.bind(this)
    this.updateCourse = this.updateCourse.bind(this)
    this.updateSectionName = this.updateSectionName.bind(this)
    this.createSection = this.createSection.bind(this)
  }

  componentDidMount(){
    let {_id, token} = JSON.parse( localStorage.getItem('data') );

    if(isNull(_id)){
      window.location.assign('/')
    }

    axios.post(env.baseUrl, qs.stringify({
      name: 'getCourses',
      professor: _id,
      token
    })).then(response => {
      this.setState({listOfCourses: response.data})
    })

  }

  updateCourse(event){
    this.setState({courseNumber: event.target.value})
  }

  createCourse(event){
    var good_to_use = true;
    this.state.listOfCourses.forEach(item => {
      if(item.courseId == this.state.courseNumber){
        good_to_use = false;
      }
    });

    if(good_to_use && this.state.courseNumber){
      let {_id, token} = JSON.parse( localStorage.getItem('data') );
      axios.post(env.baseUrl,qs.stringify({
        name: 'createCourse',
        courseId: this.state.courseNumber,
        professor: _id,
        token
      })).then(data => {
        console.log(data)

        this.setState({
          listOfCourses: [...this.state.listOfCourses, data.data],
          courseNumber : '',
          showCreateCourse : !this.state.showCreateCourse
        })

        // Wait for rerender
        setTimeout(() => {
          var placement = this.state.listOfCourses.length - 1;
          if(document.querySelector('#course-' + placement)){
            document.querySelector('#course-' + placement).scrollIntoView();
          }
        }, 1000)
      })
  
    }else{
      document.querySelector('#showUsedSectionId').style.display = 'block';
      document.querySelector('#showUsedSectionId').classList.add('slideInUp')
      setTimeout(() => {
        document.querySelector('#showUsedSectionId').style.display = 'none';
        document.querySelector('#showUsedSectionId').classList.remove('slideInUp')
      },3000)

    }

  }

  createSection(){
    let {_id, token} = JSON.parse( localStorage.getItem('data') );

    axios.post(env.baseUrl, qs.stringify({
      name: 'createSection',
      sectionName: this.state.createSectionsName,
      professor: _id,
      courseId: this.state.selectedCourseId,
      token
    })).then(response => {
      this.setState({
        createSectionsName: '',
        listOfSections : response.data,
        showCreateSection: false
      })
    })

  }

  editCourse(index, event, id){
    if(event.target.getAttribute('data-position') == 'open'){
      event.target.setAttribute('data-position','closed');
      event.target.innerText = 'Cancel';

      event.target.parentNode.children[0].innerText = 'Save';
      event.target.parentNode.children[0].classList.add('btn-outline-success')
      event.target.parentNode.children[0].classList.remove('btn-outline-danger')

      this.setState({
        selectedCourseId: id,
        selectedCourseIndex: index,
        listOfSections: this.state.listOfCourses[index].sections != undefined && this.state.listOfCourses[index].sections.length ? this.state.listOfCourses[index].sections : []
      })

      if(document.querySelector('#course-'+ index)){
        document.querySelectorAll('.courseGroup').forEach(item => item.style.display = 'none');
        document.querySelector('#course-'+index).style.display = 'flex';
        document.querySelector('#courseDetailsEdit').classList.remove('hidden')
      }

    }else{
      event.target.setAttribute('data-position','open');
      event.target.innerText = 'Sections';

      event.target.parentNode.children[0].innerText = 'Remove';
      event.target.parentNode.children[0].classList.add('btn-outline-danger')
      event.target.parentNode.children[0].classList.remove('btn-outline-success')

      this.setState({
        createSectionsName: '', 
        selectedCourseId: '',
        selectedCourseIndex: '',
        listOfSections: []
      })

      if(document.querySelector('#course-'+ index)){
        document.querySelectorAll('.courseGroup').forEach(item => item.style.display = 'flex');
        document.querySelector('#courseDetailsEdit').classList.add('hidden')
      }
    }

  }

  editSectionName(index, event){
    this.state.listOfCourses[this.state.selectedCourseIndex].sections[index].name = event.target.value
    this.setState({
      listOfCourses: this.state.listOfCourses
    })
  }

  updateSectionName(event){
    this.setState({createSectionsName: event.target.value})
  }

  removeCourse(index, event, id){
    let {_id, token} = JSON.parse( localStorage.getItem('data') );
    if(event.target.innerText == 'Remove'){
      axios.post(env.baseUrl,qs.stringify({
        name: 'removeCourse',
        professor: _id,
        token,
        courseId: id,
      })).then(response => {
        var listOfCourses = this.state.listOfCourses.filter(item => {
          if(item._id != id){
            return true;
          }else{return false}
        });

        this.setState({listOfCourses})
      })
    }else{
      console.log('save')
      axios.post(env.baseUrl, qs.stringify({
        name: 'saveCourse',
        professor: _id,
        token,
        courseId: id,
        course: JSON.stringify(this.state.listOfCourses[this.state.selectedCourseIndex])
      })).then(data => {
        console.log(data)
      })
    }

  }

  removeSection(index, event, id){
    let {_id, token} = JSON.parse( localStorage.getItem('data') );
    axios.post(env.baseUrl,qs.stringify({
      name: 'removeSection',
      professor: _id,
      token,
      courseId: this.state.selectedCourseId,
      sectionId: id
    })).then(response => {
      console.log('completed')
    })

    var listOfSections = this.state.listOfSections.filter(item => {
      if(item._id != id){
        return true;
      }else{return false}
    });

    this.setState({listOfSections})
  }

  showRenameSection(event){
    event.target.parentNode.parentNode.querySelector('.sectionIdNameInput').classList.toggle('display--none')
  }

  render(){

    return (
      <div>
        <NavSection></NavSection>

        <div className='row'>
          <div className='col-md-3'>
            <ul>
              <li><Link href='create-course'><a href='create-course'>Create Course</a></Link></li>
              <li><Link href='courses'><a href='courses'>Courses</a></Link></li>
              <li>Grades</li>
              <li>Students</li>
              <li>Usage Stats</li>
            </ul>
          </div>

          <div className='col-md-9'>
            <h1>Dashboard</h1>
            <br/>
            <h3>Course IDs</h3>
            <div>
              <Button color='secondary' size='sm' outline onClick={() => {this.setState({showCreateCourse : !this.state.showCreateCourse})}}>Add New Course ID</Button>

              { this.state.showCreateCourse && 
              <div className='inputSection fadeIn animated'>
                <input value={this.state.courseNumber} onChange={this.updateCourse}/>
                <Button id='createCourseId' color='secondary' size='sm' outline onClick={this.createCourse}>Create New Course ID</Button>
              </div>}
            </div>

            <Alert color='danger' className='animated' id='showUsedSectionId' style={{display :'none'}}>
                This course ID is already in use.
            </Alert>
            <div>
              {this.state.listOfCourses.map((item,index) => {
                return  <div className='courseGroup' key={item._id} id={'course-'+index}>
                          <span className='courseIdName'>{index} : {item.courseId}</span>
                          <div>
                            <Button color="danger" outline size="sm" onClick={(event) => {this.removeCourse(index,event,item._id)}} >Remove</Button>
                            <Button color="primary" outline size="sm" onClick={(event) => this.editCourse(index,event, item._id)} data-position='open'>Sections</Button>
                          </div>
                        </div>
              })}

              {!this.state.listOfCourses.length && <div>
                  No courses added yet.
              </div>}
            </div>

            <div id='courseDetailsEdit' className="hidden animated fadeIn">
              <h4>Sections</h4>
              <div>
                <Button color='primary' size='sm' outline onClick={() => {this.setState({showCreateSection: !this.state.showCreateSection})}}>Add New Section</Button>

                {this.state.showCreateSection && <div className='inputSection fadeIn animated'>
                  <input value={this.state.createSectionsName} onChange={this.updateSectionName} />
                  <Button color='primary' size='sm' outline onClick={this.createSection}>Create New Section</Button>
                </div>}
              </div>

              {this.state.listOfSections.map((item, index) => {
                return  <div className='sectionGroup' key={item._id} >
                          <span className='sectionIdName' className={item.name}>{index} : {item.name}</span>
                          <span className='sectionIdNameInput animated fadeIn display--none'>
                            <div className='section--rename-buttons'>
                              <span className='mdi mdi-cancel'></span>
                              <span className='mdi mdi-check-bold'></span>
                            </div>
                            <input value={item.name} onChange={() => {this.editSectionName(index, event)}}/>
                          </span>

                          <div>
                            <Button color="danger" outline size="sm" onClick={(event) => {this.removeSection(index,event,item._id)}} >Remove</Button>
                            <Button color="primary" outline size="sm" onClick={(event) => this.showRenameSection(event)} data-position='open'>Rename</Button>
                            <Button color="primary" outline size="sm" onClick={(event) => this.editCourse(index,event, item._id)} data-position='open'>Problems</Button>
                          </div>
                        </div>
              })}

              {!this.state.listOfSections.length && <div>
                  No sections added yet.
              </div>}

            </div>

          </div>
        </div>

      </div>
    )
  }

}


export default Dashboard;