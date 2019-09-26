import React, { createContext, useReducer, useEffect } from "react";

const initialState = {
    user: undefined
}

const StoreContext = createContext(initialState);

const actions = {SET_USER: 'SET_USER'};

function reducer(state, action) {
    switch (action.type) {
      case actions.SET_USER:
        return { ...state, user: action.payload };
      default:
        return state;
    }
  }

const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // TODO: I mean, delete this
  useEffect(
    () => {
      console.log({ newState: state });
    },
    [state]
  );

  return (
    <StoreContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </StoreContext.Provider>
  );
};

export { StoreContext, StoreProvider };
