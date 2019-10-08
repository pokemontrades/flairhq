import React, { useContext } from "react";
import { Button, Card, CardTitle } from 'reactstrap';
import styled from 'styled-components';
import { StoreContext } from '../state';
import { AddReference } from './addReference';
import { Link } from 'react-router-dom';

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
                <CardTitle><h1>Links</h1></CardTitle>
                <div>
                    <p className="text-center">You can add references below, and then they will appear on your public profile.</p>

                    <p className="text-center">If you are unsure what to do, go 
                    to <a href="http://www.reddit.com/r/pokemontrades/wiki/flairhq">/r/pokemontrades how to</a> or <a href="https://www.reddit.com/r/svexchange/wiki/flairhq">/r/svexchange how to</a>.</p>

                    <p className="text-center">
                        <Link to="/u/YaManicKill"><Button color="primary" outline>Public Profile</Button></Link>
                        <Button color="primary" outline href="#flairText" data-toggle="modal">Set Flair Text</Button> 
                        <Button color="primary" outline href="#flairApplication" data-toggle="modal">Apply for Flair</Button>
                    </p>
                    <p className="text-center">
                        <Button color="primary" outline href="/discord" data-toggle="modal">Join /r/pokemontrades Discord</Button>
                    </p>
                </div>
            </Card>
            <AddReference />
            <CommentsContainer>
                <CommentsCard body>
                    <CardTitle><h1>Recent comments</h1></CardTitle>
                    <CardBody>
                        A few recent comments?
                    </CardBody>
                </CommentsCard>
            </CommentsContainer>
        </Grid>
    </div>
)};