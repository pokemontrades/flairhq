import React from "react";
import { Card, CardTitle } from 'reactstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const CommentsCard = styled(Card)`
    height: 100%;
`;

const CommentList = styled.div`
    overflow: auto;
`;

export const Comments = ({comments = []}) => {
    return (
    <CommentsCard body>
        <CardTitle><h1>Comments</h1></CardTitle>
        <CommentList>
            {comments.map((comment) => (
                <div key={comment.id}>
                <Card body>
                    <p>{comment.message} - <Link to={"/u/" + comment.user2}>{comment.user2}</Link></p>
                </Card>
                <br />
                </div>
            ))}
        </CommentList>
    </CommentsCard>
)};