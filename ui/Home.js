import React, { useContext } from "react";
import { Card, CardTitle } from 'reactstrap';
import styled from 'styled-components';
import { StoreContext } from './state';

const CardBody = styled.div`
    display:grid;
    grid-template-columns: 2fr 1fr;
`;

const Grid = styled.div`
    display: grid;
    padding-top: 20px;
    @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }
    grid-column-gap: 20px;
    grid-row-gap: 20px;
`;

const CommentsContainer = styled.div`
    grid-row: 1 / 3;
    grid-column: 2;
`;

const CommentsCard = styled(Card)`
    height: 100%;
`;

export default () => {

    return (
    <div>
        <h1>Home</h1>

        <Grid>
            <Card body>
                <CardTitle><h1>Add a Reference</h1></CardTitle>
                <CardBody>
                    Form here
                </CardBody>
            </Card>
            <CommentsContainer>
                <CommentsCard body>
                    <CardTitle><h1>Recent comments</h1></CardTitle>
                    <CardBody>
                        A few recent comments?
                    </CardBody>
                </CommentsCard>
            </CommentsContainer>
            <Card body>
                <CardTitle><h1>Links</h1></CardTitle>
                <CardBody>
                    /shrug
                </CardBody>
            </Card>
        </Grid>
    </div>
)};