import React, { useContext } from "react";
import styled from 'styled-components';
import { Comments, Hatches, Info, ModComments, Trades } from './user';
import { StoreContext } from './state';

const Grid = styled.div`
    display: grid;
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

export default () => {
    const { state: {user} } = useContext(StoreContext);

    return (
    <div>
        <h1>YaManicKill</h1>

        <Grid>
            {user && user.isMod && (<ModCommentsContainer><ModComments /></ModCommentsContainer>)}
            <Trades />
            <Hatches />
            <InfoContainer><Info /></InfoContainer>
            <CommentsContainer><Comments /></CommentsContainer>
        </Grid>

    </div>
)};