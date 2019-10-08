import React from "react";
import { Card, CardTitle } from 'reactstrap';
import styled from 'styled-components';

const InfoCard = styled(Card)`
    height: 100%;
`;

export const Info = ({user}) => {
    if (!user) {
        return (<InfoCard body>Loading</InfoCard>)
    }
    return (
    <InfoCard body>
        <CardTitle><h1>Info: {user.id}</h1></CardTitle>
        <div>
        Friend codes:
        <ul>{(user.friendCodes || []).map((code) => (<li key={code}>{code}</li>))}</ul>
        Games:
        <ul>{(user.games || []).map((game) => (<li key={game.id}>IGN: {game.ign} TSV: {game.tsv}</li>))}</ul>

        </div>
        <div>
            {user.intro}
        </div>
    </InfoCard>
)};