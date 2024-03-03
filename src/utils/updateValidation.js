const validate = (updates, allowedUpdates) => {
    const updateKeys = Object.keys(updates)
    const isValid = updateKeys.every(update => allowedUpdates.includes(update))

    return isValid
}

module.exports = validate