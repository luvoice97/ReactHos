import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CallPage.css';

const CallPage = () => {
    const [currentPatient, setCurrentPatient] = useState('');
    const [patients, setPatients] = useState([]);

    const apiUrl = "http://101.79.10.210:8080";


    useEffect(() => {
        const checkUserDTO = () => {
            axios.get(`${apiUrl}/user/patients/checkUserDTO`)
                .then(response => {
                    const newName = response.data;
                    if (newName !== currentPatient) {
                        // TTS와 DingDong 소리 재생
                        axios.get(`${apiUrl}/user/naverTTS?text=${newName}`)
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

                                // 7초 동안 모달 표시
                                setTimeout(() => document.getElementById('myModal').style.display = 'block', 1000);
                                setTimeout(() => document.getElementById('myModal').style.display = 'none', 7000);

                                // 작업 후 세션 초기화
                                axios.get(`${apiUrl}/user/patients/clearSession`)
                                    .catch(error => console.error('세션 정리 중 오류 발생:', error));
                            })
                            .catch(error => console.error('TTS 요청 중 오류 발생:', error));
                    }
                })
                .catch(error => console.error('UserDTO 체크 중 오류 발생:', error));
        };

        // 1초마다 checkUserDTO 확인
        const intervalId = setInterval(checkUserDTO, 1000);

        // 3초마다 환자 목록 갱신
        const loadPatientList = () => {
            axios.get(`${apiUrl}/user/patients/list`)
                .then(response => {
                    setPatients(response.data);
                })
                .catch(error => console.error('환자 목록 로드 중 오류 발생:', error));
        };

        loadPatientList();
        const patientListIntervalId = setInterval(loadPatientList, 3000);

        // 컴포넌트 언마운트 시 interval 종료
        return () => {
            clearInterval(intervalId);
            clearInterval(patientListIntervalId);
        };
    }, [currentPatient]); // currentPatient가 변경될 때마다 checkUserDTO를 실행

    // 환자 호출 함수
    const callPatient = (patient) => {
        axios.get(`${apiUrl}/user/patients/call?seq=${patient.seq}&name=${patient.name}`)
            .then(() => {
                // 호출 후 환자 목록 갱신
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
