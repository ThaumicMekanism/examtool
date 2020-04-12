import React, { useState } from "react";
import { Form, FormControl, InputGroup } from "react-bootstrap";
import FailText from "./FailText";
import LoadingButton from "./LoadingButton";
import post from "./post";

export default function Question({
    question, i, j, token,
}) {
    const [value, setValue] = useState("");
    const [savedValue, setSavedValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [failText, setFailText] = useState("");

    let contents;
    if (question.type === "multiple_choice") {
        contents = (
            <div style={{ marginBottom: 10 }}>
                {question.options.map((option) => (
                    <Form.Check
                        custom
                        name={question.id}
                        type="radio"
                        label={option}
                        value={option}
                        id={`${question.id}|${option}`}
                        onChange={(e) => { setValue(e.target.value); }}
                    />
                ))}
            </div>
        );
    } else if (question.type === "short_answer") {
        contents = (
            <InputGroup className="mb-3">
                <FormControl onChange={(e) => { setValue(e.target.value); }} />
            </InputGroup>
        );
    }

    const submit = async () => {
        setSaving(true);
        const ret = await post("submit_question", {
            id: question.id,
            value,
            token,
        });
        setSaving(false);
        if (!ret.ok) {
            setFailText("Server failed to respond, please try again.");
        }
        try {
            const data = await ret.json();
            if (!data.success) {
                setFailText("Server responded but failed to save, please refresh and try again.");
            }
            setSavedValue(value);
        } catch {
            setFailText("Server returned invalid JSON. Please try again.");
        }
    };

    return (
        <>
            <Form>
                <Form.Label>
                    <h5 style={{ marginTop: 8, marginBottom: 0 }}>
                        Q
                        {i + 1}
                        .
                        {j + 1}
                    </h5>
                    {" "}
                    <small>
                        Points:
                        {" "}
                        {question.points}
                    </small>
                    <div
                        style={{ marginTop: 8 }}
                        dangerouslySetInnerHTML={{ __html: question.html }}
                    />
                </Form.Label>
                {contents}
                <LoadingButton
                    loading={saving}
                    disabled={saving || (value === savedValue)}
                    onClick={submit}
                >
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {(value === savedValue) ? "Saved" : saving ? "Saving..." : "Save"}
                </LoadingButton>
                <FailText text={failText} />
            </Form>
            <br />
        </>
    );
}
