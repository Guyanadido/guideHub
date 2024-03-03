const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
] 

const parseAndSanitizeDate = (userInput) => {
    userInput.forEach(input => input.trim())
    const dates = userInput.map(input => {
        const [month, day, year] = input.split(' ')
        const currentYear = new Date().getUTCFullYear()
        if(!months.includes(month.toLowerCase()) || parseInt(day) > 31 || parseInt(day) < 0 || parseInt(year) < currentYear) {
            throw new Error('invalid date')
        }
        return new Date(`${month} ${day}, ${year}`)
    })
    return dates
}

module.exports = parseAndSanitizeDate