import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CallPage.css';

const CallPage = () => {
    const [currentPatient, setCurrentPatient] = useState('');
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const checkUserDTO = () => {
            axios.get('http://localhost:8080/user/patients/checkUserDTO')
                .then(response => {
                    const newName = response.data;
                    if (newName !== currentPatient) {
                        // Play TTS and DingDong sound
                        axios.get(`http://localhost:8080/user/naverTTS?text=${newName}`)
                            .then(fileUrl => {
                                const ttsSound = document.getElementById('tts');
                                ttsSound.src = fileUrl;
                                ttsSound.currentTime = 0;
                                ttsSound.play().catch(error => console.error('TTS 소리 재생 중 오류 발생:', error));

                                const dingdongSound = document.getElementById('DingDong');
                                dingdongSound.currentTime = 0;
                                dingdongSound.play().catch(error => console.error('DingDong 소리 재생 중 오류 발생:', error));

                                setCurrentPatient(newName);
                                document.getElementById('modalTitle').innerHTML = `${newName} 님<br>진료실로 들어오세요`;

                                // Display modal for 7 seconds
                                setTimeout(() => document.getElementById('myModal').style.display = 'block', 1000);
                                setTimeout(() => document.getElementById('myModal').style.display = 'none', 7000);

                                // Clear session after the action
                                axios.get('http://localhost:8080/user/patients/clearSession')
                                    .catch(error => console.error('세션 정리 중 오류 발생:', error));
                            })
                            .catch(error => console.error('TTS 요청 중 오류 발생:', error));
                    }
                })
                .catch(error => console.error('UserDTO 체크 중 오류 발생:', error));
        };

        // Set interval to check every second
        const intervalId = setInterval(checkUserDTO, 1000);

        // Load patient list initially and every 3 seconds
        const loadPatientList = () => {
            axios.get('http://localhost:8080/user/patients/list')
                .then(response => {
                    setPatients(response.data);
                })
                .catch(error => console.error('환자 목록 로드 중 오류 발생:', error));
        };

        loadPatientList();
        const patientListIntervalId = setInterval(loadPatientList, 3000);

        // Cleanup intervals on unmount
        return () => {
            clearInterval(intervalId);
            clearInterval(patientListIntervalId);
        };
    }, [currentPatient]); // Dependency on currentPatient for the check

    // Call patient function
    const callPatient = (patient) => {
        axios.get(`http://localhost:8080/user/patients/call?seq=${patient.seq}&name=${patient.name}`)
            .then(() => {
                // Reload patient list after calling
                setPatients(prevPatients => prevPatients.filter(p => p.seq !== patient.seq));
            })
            .catch(error => console.error('환자 호출 중 오류 발생:', error));
    };

    return (
        <div className="callpage-body">
            <header className="callpage-header">
                <h1>정형외과</h1>
            </header>

            <div className="callpage-container">
                <div className="callpage-section">
                    <h2 className="callpage-h2">현재 진료 중인 환자</h2>
                    <div id="currentPatient" className="callpage-currentPatient">{currentPatient}</div>
                </div>

                <div className="callpage-section">
                    <div className="callpage-patientCount">대기 환자 수: <span>{patients.length}</span>명</div>
                    <ul className="callpage-patientList">
                        {patients.map((patient) => (
                            <li key={patient.seq} className="callpage-patientItem" onClick={() => callPatient(patient)}>
                                {patient.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <audio id="DingDong" src="./mp3/DingDong.mp3" preload="auto"></audio>
            <audio id="tts" src="" preload="auto"></audio>

            <div id="myModal" className="callpage-modal">
                <div className="callpage-modal-content">
                    <span className="callpage-close" onClick={() => document.getElementById('myModal').style.display = 'none'}>×</span>
                    <h2 id="modalTitle"></h2>
                </div>
            </div>
        </div>
    );
};

export default CallPage;
