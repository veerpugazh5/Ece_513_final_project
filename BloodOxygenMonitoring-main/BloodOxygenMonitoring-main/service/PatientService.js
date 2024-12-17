const Particle = require('../models/Particle');

const getWeeklyStats = async (deviceSerialNumbers) => {
    try {
        if (!deviceSerialNumbers || !Array.isArray(deviceSerialNumbers)) {
            throw new Error('deviceSerialNumbers must be a non-empty array.');
        }

        const trimmedSerialNumbers = deviceSerialNumbers.map(sn => sn.trim());

        // Helper function to get Monday of the week
        const getMonday = (date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
            return new Date(d.setDate(diff));
        };

        // Fetch the earliest and latest timestamps available in the database
        const earliestReading = await Particle.findOne({ 'deviceSerialNumber': { $in: trimmedSerialNumbers } }).sort({ timestamp: 1 });
        const latestReading = await Particle.findOne({ 'deviceSerialNumber': { $in: trimmedSerialNumbers } }).sort({ timestamp: -1 });

        if (!earliestReading || !latestReading) {
            throw new Error('No readings found for the provided devices.');
        }

        const earliestDate = getMonday(earliestReading.timestamp);
        const latestDate = getMonday(latestReading.timestamp);

        // Generate weeks within the available range
        const weeks = [];
        let currentStart = earliestDate;
        while (currentStart <= latestDate) {
            const startOfWeek = new Date(currentStart);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            weeks.push({ start: startOfWeek, end: endOfWeek });
            currentStart.setDate(currentStart.getDate() + 7);
        }

        const stats = [];

        for (const week of weeks) {
            const readings = await Particle.find({
                'deviceSerialNumber': { $in: trimmedSerialNumbers },
                'timestamp': { $gte: week.start, $lte: week.end }
            });

            const heartRates = readings.map(r => r.heart_rate).filter(hr => hr !== undefined);

            stats.push({
                fromDate: week.start.toISOString().split('T')[0],
                toDate: week.end.toISOString().split('T')[0],
                averageHeartRate: heartRates.length ? (heartRates.reduce((a, b) => a + b, 0) / heartRates.length).toFixed(2) : null,
                maxHeartRate: heartRates.length ? Math.max(...heartRates) : null,
                minHeartRate: heartRates.length ? Math.min(...heartRates) : null
            });
        }

        return stats;
    } catch (error) {
        console.error('Error retrieving weekly stats:', error);
        throw error;
    }
};

const getDailyStats = async (deviceSerialNumbers) => {
    try {
        if (!deviceSerialNumbers || !Array.isArray(deviceSerialNumbers)) {
            throw new Error('deviceSerialNumbers must be a non-empty array.');
        }

        const trimmedSerialNumbers = deviceSerialNumbers.map(sn => sn.trim());

        // Fetch the earliest and latest timestamps available in the database
        const earliestReading = await Particle.findOne({ 'deviceSerialNumber': { $in: trimmedSerialNumbers } }).sort({ timestamp: 1 });
        const latestReading = await Particle.findOne({ 'deviceSerialNumber': { $in: trimmedSerialNumbers } }).sort({ timestamp: -1 });

        if (!earliestReading || !latestReading) {
            throw new Error('No readings found for the provided devices.');
        }

        const startDate = new Date(earliestReading.timestamp);
        const endDate = new Date(latestReading.timestamp);

        const stats = [];

        // Loop through each day and calculate the average heart rate and spo2
        for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const readings = await Particle.find({
                'deviceSerialNumber': { $in: trimmedSerialNumbers },
                'timestamp': { $gte: currentDate, $lt: nextDay }
            });

            const heartRates = readings.map(r => r.heart_rate).filter(hr => hr !== undefined);
            const spo2Values = readings.map(r => r.spo2).filter(spo2 => spo2 !== undefined);

            stats.push({
                date: currentDate.toISOString().split('T')[0],
                heartRate: heartRates.length ? (heartRates.reduce((a, b) => a + b, 0) / heartRates.length).toFixed(2) : null,
                spo2: spo2Values.length ? (spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length).toFixed(2) : null
            });
        }

        return stats;
    } catch (error) {
        console.error('Error retrieving daily stats:', error);
        throw error;
    }
};

const getDailyStatsByDateRange = async (deviceSerialNumbers, startDate, endDate) => {
    try {
        if (!deviceSerialNumbers || !Array.isArray(deviceSerialNumbers)) {
            throw new Error('deviceSerialNumbers must be a non-empty array.');
        }

        const trimmedSerialNumbers = deviceSerialNumbers.map(sn => sn.trim());
        const stats = [];

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Loop through each day in the provided range and calculate averages
        for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const readings = await Particle.find({
                'deviceSerialNumber': { $in: trimmedSerialNumbers },
                'timestamp': { $gte: currentDate, $lt: nextDay }
            });

            const heartRates = readings.map(r => r.heart_rate).filter(hr => hr !== undefined);
            const spo2Values = readings.map(r => r.spo2).filter(spo2 => spo2 !== undefined);

            stats.push({
                date: currentDate.toISOString().split('T')[0],
                heartRate: heartRates.length ? (heartRates.reduce((a, b) => a + b, 0) / heartRates.length).toFixed(2) : null,
                spo2: spo2Values.length ? (spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length).toFixed(2) : null
            });
        }

        return stats;
    } catch (error) {
        console.error('Error retrieving daily stats:', error);
        throw error;
    }
};


module.exports = { getWeeklyStats, getDailyStats, getDailyStatsByDateRange };