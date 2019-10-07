import React, { useContext, useState, useEffect } from "react";
import styled from 'styled-components';
import { Comments, Hatches, Info, ModComments, Trades } from './';
import { StoreContext } from '../state';

const Grid = styled.div`
    display: grid;
    padding-top: 20px;
    @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 992px) {
        grid-template-columns: repeat(3, 1fr);
    }
    grid-column-gap: 20px;
    grid-row-gap: 20px;
`;

const CommentsContainer = styled.div`
    @media (min-width: 768px) {
        grid-row: 1 / 4;
        grid-column: 2;
    }
    @media (min-width: 992px) {
        grid-column: 3;
    }
`;

const InfoContainer = styled.div`
    @media (min-width: 992px) {
        grid-column: auto / span 2;
    }
`;

const ModCommentsContainer = styled.div`
    @media (min-width: 992px) {
        grid-column: auto / span 2;
    }
`;

export default ({name}) => {
    const { state: {user} } = useContext(StoreContext);
    const [otherUser, setUser] = useState(undefined);
  
    async function fetchData() {
      const res = await fetch(`/api/user/get/${name}`);
      if (res.ok) {
        res.json()
        .then(res => setUser(res));
      }
    }
  
    useEffect(() => {
      fetchData();
    }, []);

    if (!otherUser) {
        return (
            <div>
                Loading
            </div>
        )
    }

    return (
    <div>
        <h1>{otherUser.id}</h1>

        <Grid>
            {user && user.isMod && (<ModCommentsContainer><ModComments /></ModCommentsContainer>)}
            <Trades trades={otherUser.references.filter((ref) => ref.type === "event" || ref.type === "shiny" || ref.type === "casual" || ref.type === "bank")} />
            <Hatches hatches={otherUser.references.filter((ref) => ref.type === "egg")}  />
            <InfoContainer><Info user={otherUser} /></InfoContainer>
            <CommentsContainer><Comments comments={otherUser.comments} /></CommentsContainer>
        </Grid>

    </div>
)};