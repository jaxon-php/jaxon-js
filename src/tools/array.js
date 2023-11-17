jaxon.tools.array = {
    /*
    Function jaxon.tools.array.is_in

    Looks for a value within the specified array and, if found, returns true; otherwise it returns false.

    Parameters:
        array - (object): The array to be searched.
        valueToCheck - (object): The value to search for.

    Returns:
        true : The value is one of the values contained in the array.
        false : The value was not found in the specified array.
    */
    is_in: function(array, valueToCheck) {
        // It's important to have '==' and not '===' here.
        return array.find(value => value == valueToCheck);
    }
};
