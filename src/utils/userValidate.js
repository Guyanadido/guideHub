const isValidUserUpdate = (updates) => {
    const allowedUpdates = ['firstName', 'secondName', 'email', 'password', 'role', 'status']
    const isValid = updates.every(update => allowedUpdates.includes(update))

    if(!isValid) {
        return false
    }

    return true
}

const checkRole = (role) => {
    const allowedRoles = ['tourist', 'guide', undefined]
    if(allowedRoles.includes(role)){
        return true
    }

    return false
}

const checkStatus = (status) => {
    if (typeof status !== 'boolean' && typeof status !== 'undefined') {
        console.log(typeof(status))
        return false
    } 
    return true
}

const checkValidation = (updates) => {
    if(isValidUserUpdate(Object.keys(updates))) {
        const isValid = checkRole(updates['role']) && checkStatus(updates['status'])
        return isValid
    }

    return false
}

module.exports = checkValidation