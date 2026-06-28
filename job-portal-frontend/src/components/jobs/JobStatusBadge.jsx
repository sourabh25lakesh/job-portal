import {
    getJobStatusClass,
    getJobStatusLabel,
} from "../../utils/jobStatus";

function JobStatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getJobStatusClass(status)}`}
        >
            {getJobStatusLabel(status)}
        </span>
    );
}

export default JobStatusBadge;
