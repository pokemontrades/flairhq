import React from "react";
import { Card, CardTitle } from 'reactstrap';
import styled from 'styled-components';

const CommentsCard = styled(Card)`
    height: 100%;
`;

const CommentList = styled.div`
    overflow: auto;
`;

export const ModComments = () => {
    let i = 0;
    return (
    <CommentsCard body>
        <CardTitle><h1>Moderator Comments</h1></CardTitle>
        <CommentList>
            {Array.from(Array(3)).map(() => (
                <div key={i++}>
                <Card body>
                    We have suspicions about this user.
                </Card>
                <br />
                </div>
            ))}
        </CommentList>
    </CommentsCard>
)};