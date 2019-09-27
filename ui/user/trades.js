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

export const Trades = () => (
    <Card body>
        <CardTitle><h1>Trades</h1></CardTitle>
        <CardBody>
            <Highlighted>123</Highlighted>
            <LowLighted>
                Events: 100
                Shinies: 10
            </LowLighted>
        </CardBody>
    </Card>
);