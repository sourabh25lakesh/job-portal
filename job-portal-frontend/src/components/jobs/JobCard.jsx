function JobCard({ job }) {

    return (

        <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm hover:shadow-xl transition duration-300">

            <h3 className="text-2xl font-semibold text-gray-900">
                {job.title}
            </h3>

            <p className="mt-3 text-gray-600">
                {job.company}
            </p>

            <p className="mt-2 text-gray-500">
                📍 {job.location}
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