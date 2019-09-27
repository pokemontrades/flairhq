import React from "react";
import { Card, CardTitle } from 'reactstrap';
import styled from 'styled-components';

const CommentsCard = styled(Card)`
    height: 100%;
`;

const CommentList = styled.div`
    overflow: auto;
`;

export const Comments = () => {
    let i = 0;
    return (
    <CommentsCard body>
        <CardTitle><h1>Comments</h1></CardTitle>
        <CommentList>
            {Array.from(Array(10)).map(() => (
                <div key={i++}>
                <Card body>
                    This user is perfect, I have no issues with him.
                </Card>
                <br />
                </div>
            ))}
        </CommentList>
    </CommentsCard>
)};