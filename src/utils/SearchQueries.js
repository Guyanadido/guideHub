 const parseAndSanitizeDate = require('./parseDate')

const blogSearchQuery = ({guide, title, excerpt, catagories, placesFeatured, tags}) => {
    const query = {}

    if (guide) {
        query.guide = guide
    }

    if (title) {
        query.title = {$regex: title, $options: 'i'}
    }

    if (excerpt) {
        query.excerpt = {$regex: excerpt, $options: 'i'}
    }

    if (catagories) {
        query.catagories = {$in: catagories}
    }

    if (placesFeatured) {
        query.placesFeatured = {$in: placesFeatured}
    }
 
    if (catagories) {
        query.tags = {$in: tags}
    }

    return query
}

const guideSearchQuery = ({places, tourTypes}) => {
    const query = {
        places: [],
        tourTypes: []
    }
    console.log(places)
    console.log(tourTypes)
    if(places) {
        places = JSON.parse(places)
        
    }

    if(tourTypes) {
        tourTypes = JSON.parse(tourTypes)
        tourTypes.forEach(type => query.tourTypes.push(type))
    }

    return query 
}

const tourTypeSearchQuery = ({title, description, minPrice, maxPrice ,locations, tourTypes, sd, ed}) => {
    
    const query = {}
    const priceConditions = tourPriceSearch(minPrice, maxPrice)
    const dateConditions = tourDateSearch(sd, ed)

    if (priceConditions.length > 0 || dateConditions.length > 0) {
        query.$and = [...priceConditions, ...dateConditions]
    }

    if(title) {
        query.title = {$regex: title, $options: 'i'}
    }

    if(description) {
        query.description = {$regex: description, $options: 'i'}
    }

    if(locations) {
        const parsedLocation = JSON.parse(locations)
        query.locations = {$in: parsedLocation}
    }

    if(tourTypes) {
        const parsedTour = JSON.parse(tourTypes)
        query.tourTypes = {$in: parsedTour}
    }
    return query
}

const bookingSearch = ({minDate, maxDate ,status}) => {

    const query = {}
    const dateConditions = bookingDateSearch(minDate, maxDate)

    if (dateConditions.length > 0) {
        query.$and = [...dateConditions]
    }

    if(status) {
        query.status = status
    }

    return query
}

const bookingDateSearch = (minDate, maxDate) => {
    const dateSearch = []
    if(minDate) {
        const date = parseAndSanitizeDate([minDate])[0]
        dateSearch.push({bookingDate: {$gte: date}})
    }

    if(maxDate) {
        const date = parseAndSanitizeDate([maxDate])[0]
        dateSearch.push({bookingDate: {$lte: date}})
    }

    // dateSearch = [
    //     {bookingDate: {$gte: "january 14, 2021"}},
    //     {bookingDate: {$lte: "june 12, 2023"}}
    // ]
    return dateSearch
}

const tourDateSearch = (minDate, maxDate) => {
    const dateSearch = []
    if(minDate) {
        const date = parseAndSanitizeDate([minDate])[0]
        dateSearch.push({startDate: {$gte: date}})
    }

    if(maxDate) {
        const date = parseAndSanitizeDate([maxDate])[0]
        dateSearch.push({endDate: {$lte: date}})
    }
    return dateSearch
}

const tourPriceSearch = (minPrice, maxPrice) => {
    const priceSearch = []
    if(minPrice) {
        priceSearch.push({price: {$gte: minPrice}})
    }

    if(maxPrice) {
        priceSearch.push({price: {$lte: maxPrice}})
    }
    return priceSearch
}
 
module.exports = {
    blogSearchQuery,
    guideSearchQuery,
    tourTypeSearchQuery,
    bookingSearch,
}