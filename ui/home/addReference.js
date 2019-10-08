import React, {useState} from "react";
import { Button, Card, CardTitle, Col, Form, FormGroup, Input } from 'reactstrap';
import styled from 'styled-components';

const AddReferenceCard = styled(Card)`
    height: 100%;
`;

const CommentList = styled.div`
    overflow: auto;
`;

const Select = styled(Input)`
    &:invalid {
        color: gray;
    }
`;

export const AddReference = () => {
    const [type, setType] = useState("");

    return (
    <AddReferenceCard body>
        <CardTitle><h1>Add a Reference</h1></CardTitle>
        <Form>
            <FormGroup>
                <Input type="url" name="permalink" placeholder="Permalink" />
            </FormGroup>
            <FormGroup>
                <Select required type="select" name="select" value={type} onChange={(event) => setType(event.target.value)}>
                    <option disabled hidden value="">Type</option>
                    <optgroup label="/r/pokemontrades">
                        {[{value: "event", name: "Event"}, {value: "shiny", name: "Shiny"}, {value: "casual", name: "Casual/Competitive"}, {value: "giveaway", name: "Giveaway"}, {value: "involvement", name: "Free Tradeback/Free Redemption"}]
                        .map((type) => (<option key={type.value} value={type.value}>{type.name}</option>))}
                    </optgroup>
                    <optgroup label="/r/SVExchange">
                        {[{value: "egg", name: "Egg Hatch"}, {value: "eggcheck", name: "Egg/TSV Check"}, {value: "giveaway", name: "Giveaway"}]
                        .map((type) => (<option key={type.value} value={type.value}>{type.name}</option>))}
                    </optgroup>
                    <optgroup label="Other">
                        {[{value: "misc", name: "Misc"}]
                        .map((type) => (<option key={type.value} value={type.value}>{type.name}</option>))}
                    </optgroup>
                </Select>
            </FormGroup>
            {(type === "event" || type === "shiny" || type === "casual" || type === "") ? (
                <FormGroup row>
                    <Col sm={6}>
                        <Input type="text" name="gave" placeholder="Gave" />
                    </Col>
                    <Col sm={6}>
                        <Input type="text" name="got" placeholder="Got" />
                    </Col>
                </FormGroup>
            ) : (
                <FormGroup>
                    <Input type="text" name="description" placeholder="Description" />
                </FormGroup>
            )}
            {(type === "event" || type === "shiny" || type === "casual" || type === "involvement" || type === "egg" || type === "misc" || type === "") ? (
                <FormGroup>
                    <Input type="text" name="user" placeholder="Other User" />
                </FormGroup>
            ) : (
                <FormGroup>
                    <Input type="text" name="given" placeholder="Number Given" />
                </FormGroup>
            )}
            <FormGroup>
                <Input type="textarea" name="notes" placeholder="Public Notes" />
            </FormGroup>
            <FormGroup>
                <Input type="textarea" name="privateNotes" placeholder="Private Notes" />
            </FormGroup>
            <Button>Submit</Button>
        </Form>
    </AddReferenceCard>
)};