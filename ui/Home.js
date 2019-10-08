import React, { useContext } from "react";
import { Button, Card, CardTitle } from 'reactstrap';
import styled from 'styled-components';
import { StoreContext } from './state';
import { AddReference } from './home/addReference';

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
                    <p class="text-center">You can add references below, and then they will appear on your public profile.</p>

                    <p class="text-center">If you are unsure what to do, go 
                    to <a href="http://www.reddit.com/r/pokemontrades/wiki/flairhq">/r/pokemontrades how to</a> or <a href="https://www.reddit.com/r/svexchange/wiki/flairhq">/r/svexchange how to</a>.</p>

                    <p class="text-center">
                        <Button color="primary" outline ng-href="/u/YaManicKill" href="/u/YaManicKill">Public Profile</Button> 
                         <Button color="primary" outline href="#flairText" data-toggle="modal">Set Flair Text</Button> 
                         <Button color="primary" outline href="#flairApplication" data-toggle="modal">Apply for Flair</Button>
                    </p>
                    <p class="text-center">
                        <Button color="primary" outline href="/discord" data-toggle="modal" ng-if="user.flair.ptrades.flair_text !== null &amp;&amp; user.flair.svex.flair_text !== null">Join /r/pokemontrades Discord</Button>
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