function JobCard({ job }) {

    return (

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">

            <h3 className="break-words text-xl font-semibold text-gray-900 sm:text-2xl">
                {job.title}
            </h3>

            <p className="mt-3 text-gray-600">
                {job.company}
            </p>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Location: {job.location}
            </p>

            <span className="inline-block mt-4 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium">
                {job.type}
            </span>

            <button
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition duration-300"
            >
                Apply Now
            </button>

        </div>
    );
}

export default JobCard;
