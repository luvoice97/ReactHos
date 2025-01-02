import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';  // CSS 파일 import

const AdminPage = () => {
  const [currentPatient, setCurrentPatient] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientList, setPatientList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 환자 목록을 3초마다 갱신
    const intervalId = setInterval(loadPatientList, 3000);
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 interval 종료
  }, []);

  useEffect(() => {
    // 현재 진료 중인 환자 확인
    const intervalId = setInterval(CheckCurrentPatient, 1000);
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 interval 종료
  }, []);

  // 현재 진료 중인 환자 확인
  const CheckCurrentPatient = () => {
    axios.get('http://localhost:8080/user/patients/CheckCurrent')
      .then(response => {
        setCurrentPatient(response.data);
      })
      .catch(error => {
        console.error('환자 목록 로드 중 오류 발생:', error);
      });
  };

  // 환자 목록 불러오기
  const loadPatientList = () => {
    axios.get('http://localhost:8080/user/patients/list')
      .then(response => {
        setPatientList(response.data);
      })
      .catch(error => {
        console.error('환자 목록 요청 중 오류 발생:', error);
      });
  };

  // 환자 추가
  const addPatient = () => {
    if (!patientName) {
      setErrorMessage('이름을 입력해주세요');
      return;
    }

    axios.get(`http://localhost:8080/user/patients/add?patient=${encodeURIComponent(patientName)}`)
    .then(() => {
      setPatientName('');
      loadPatientList(); // 목록 갱신
      setErrorMessage('');
    })
    .catch(error => {
      console.error('환자 추가 중 오류 발생:', error);
    });
  
  };

  // 환자 호출
  const callPatient = (patient) => {
    setCurrentPatient(patient.name);
  
    axios.get(`http://localhost:8080/user/patients/call?seq=${patient.seq}&name=${encodeURIComponent(patient.name)}`)
      .then(() => {
        loadPatientList(); // 목록 갱신
      })
      .catch(error => {
        console.error('환자 호출 중 오류 발생:', error);
      });
  };
  

  // 환자 삭제
  const deletePatient = (seq) => {
    axios.get(`http://localhost:8080/user/patients/delete?seq=${seq}`)
      .then(() => {
        loadPatientList(); // 목록 갱신
      })
      .catch(error => {
        console.error('환자 삭제 중 오류 발생:', error);
      });
  };
  

  return (
    <div>
      <header>
        <h1>관리자 화면</h1>
      </header>

      <div className="container">
        {/* 왼쪽: 현재 호출 중인 환자 */}
        <div className="left">
          <h2>현재 진료 중인 환자</h2>
          <div id="currentPatient">{currentPatient}</div>
        </div>

        {/* 중앙: 환자 입력 */}
        <div className="center">
          <h2>환자 입력</h2>
          <input
            type="text"
            id="patientInput"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="환자 이름 입력"
          />
          <button id="addPatientBtn" onClick={addPatient}>환자 추가</button>
          {errorMessage && <div id="idDiv">{errorMessage}</div>}
          <button id="openCallPageButton" onClick={() => window.open('/callpage', '_blank')}>호출 페이지</button>
        </div>

        {/* 오른쪽: 입력한 환자 목록 */}
        <div className="right">
          <h2>환자 목록</h2>
          <ul id="patientList">
            {patientList.map((patient) => (
              <li className="patient-item" key={patient.seq}>
                <span>{patient.name}</span>
                <button onClick={() => callPatient(patient)}>호출</button>
                <button onClick={() => deletePatient(patient.seq)}>삭제</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Popup Modal */}
      <div id="myModal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => document.getElementById('myModal').style.display = 'none'}>&times;</span>
          <h2 id="modalTitle"></h2>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
