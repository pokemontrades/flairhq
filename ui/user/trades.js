import React from "react";
import { Card, CardTitle } from 'reactstrap';
import styled from 'styled-components';

const CardBody = styled.div`
    display:grid;
    grid-template-columns: 2fr 1fr;
`;

const Highlighted = styled.div`
    font-size: 5rem;
`;

const LowLighted = styled.div`
    margin: auto;
`;

export const Trades = ({trades = []}) => (
    <Card body>
        <CardTitle><h1>Trades</h1></CardTitle>
        <CardBody>
            <Highlighted>{trades.length}</Highlighted>
            <LowLighted>
                Events: {trades.filter((trade) => trade.type === "event").length}
                <br />
                Shinies: {trades.filter((trade) => trade.type === "shiny").length}
            </LowLighted>
        </CardBody>
    </Card>
);