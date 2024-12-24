const idealTemperatures = {
    spring: 5,
    fall: 5,
    summer: 20,
    winter: -5
};

async function saveMidnightTemperature() {
    const apiKey = 'd5b368726de1a18308d2c8901e175904';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${apiKey}&units=metric&lang=kr`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('온도 데이터를 가져오는 데 실패했습니다.');
        }

        const data = await response.json();
        const currentTemperature = data.main.temp;

        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);

        const midnightTempData = {
            temperature: currentTemperature,
            timestamp: midnight.getTime()
        };

        localStorage.setItem('midnightTemperature', JSON.stringify(midnightTempData));
    } catch (error) {
        console.error(error);
    }
}

function getMidnightTemperature() {
    const midnightTempData = localStorage.getItem('midnightTemperature');
    if (midnightTempData) {
        const { temperature, timestamp } = JSON.parse(midnightTempData);
        const now = new Date();

        if (now.getTime() - timestamp >= 24 * 60 * 60 * 1000) {
            saveMidnightTemperature();
        }

        return temperature;
    }
    return null;
}

function calculateScore(currentTemperature) {
    const now = new Date();
    let season = '';
    if (now.getMonth() >= 2 && now.getMonth() <= 4) {
        season = 'spring';
    } else if (now.getMonth() >= 5 && now.getMonth() <= 7) {
        season = 'summer';
    } else if (now.getMonth() >= 8 && now.getMonth() <= 10) {
        season = 'fall';
    } else {
        season = 'winter';
    }

    const idealTemp = idealTemperatures[season];
    const tempDifference = Math.abs(currentTemperature - idealTemp);
    const score = Math.max(0, 100 - (tempDifference * 7));
    return score.toFixed(2);
}

function updateScoreDisplay(score) {
    const scoreElement = document.getElementById('score');
    scoreElement.innerText = `Score: ${score}`;

    if (score >= 80) {
        scoreElement.classList.add('good');
    } else if (score >= 50) {
        scoreElement.classList.add('normal');
    } else {
        scoreElement.classList.add('poor');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const midnightTemperature = getMidnightTemperature();

    if (midnightTemperature !== null) {
        const score = calculateScore(midnightTemperature);
        updateScoreDisplay(score);
    } else {
        document.getElementById('score').innerText = "자정 온도가 아직 저장되지 않았습니다.";
    }
});

saveMidnightTemperature();
